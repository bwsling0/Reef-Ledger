import React, { useState, useEffect, useRef, useMemo } from "react";
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import {
  Search, X, Plus, Camera, Calendar, Trash2, ChevronDown,
  Check, StickyNote, RotateCcw, Award, Settings, ArrowLeft, Lock
} from "lucide-react";

/* ---------------------------------------------------------
   Regions & Phyla
--------------------------------------------------------- */
const REGIONS = [
  { id: "north-atlantic", name: "North Atlantic Ocean", subtitle: "Canada to Cape May" },
];

const PHYLA = [
  { id: "fish-vertebrates", name: "Fish & Vertebrates" },
  { id: "mollusks", name: "Mollusks" },
  { id: "crustaceans", name: "Crustaceans & Arthropods" },
  { id: "echinoderms", name: "Echinoderms" },
  { id: "cnidarians", name: "Jellyfish, Corals & Anemones" },
  { id: "worms-other", name: "Worms & Other Invertebrates" },
];

const RARITY_LEVELS = ["Common", "Uncommon", "Rare", "Very Rare"];
const RARITY_COLOR = {
  "Common": { bg: "rgba(143,191,174,0.18)", fg: "#8FBFAE" },
  "Uncommon": { bg: "rgba(212,175,55,0.18)", fg: "#D4AF37" },
  "Rare": { bg: "rgba(228,87,46,0.18)", fg: "#E4572E" },
  "Very Rare": { bg: "rgba(180,90,220,0.18)", fg: "#C084E8" },
};

function slug(str) {
  return String(str).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/* ---------------------------------------------------------
   Species data — North Atlantic (Canada to Cape May)
   Rarity ratings are best-estimate, based on general field-
   guide/ecological knowledge of how often each species turns
   up while snorkeling, diving, fishing, or boating in this
   region — not individually sourced per species.
--------------------------------------------------------- */
const FISH_VERTEBRATES = [
  ["Atlantic Cod", "Gadus morhua", "Uncommon"],
  ["Atlantic Mackerel", "Scomber scombrus", "Common"],
  ["Atlantic Herring", "Clupea harengus", "Common"],
  ["Striped Bass", "Morone saxatilis", "Common"],
  ["Winter Flounder", "Pseudopleuronectes americanus", "Common"],
  ["Haddock", "Melanogrammus aeglefinus", "Uncommon"],
  ["Pollock", "Pollachius virens", "Common"],
  ["Atlantic Sturgeon", "Acipenser oxyrinchus", "Rare"],
  ["Bluefin Tuna", "Thunnus thynnus", "Rare"],
  ["Spiny Dogfish", "Squalus acanthias", "Common"],
  ["Little Skate", "Leucoraja erinacea", "Common"],
  ["Harbor Seal", "Phoca vitulina", "Common"],
  ["Gray Seal", "Halichoerus grypus", "Common"],
  ["Harbor Porpoise", "Phocoena phocoena", "Uncommon"],
  ["Humpback Whale", "Megaptera novaeangliae", "Uncommon"],
  ["North Atlantic Right Whale", "Eubalaena glacialis", "Very Rare"],
  ["Loggerhead Sea Turtle", "Caretta caretta", "Rare"],
  ["Northern White Crust", "Aplidium pallidum", "Uncommon"],
  ["Tunicate (Molgula citrina)", "Molgula citrina", "Common"],
  ["Sea Grape", "Molgula manhattensis", "Common"],
  ["Tunicate (Didemnum vexillum)", "Didemnum vexillum", "Common"],
  ["Pink Sea Pork", "Aplidium pellucidum", "Uncommon"],
  ["Stalked Tunicate", "Boltenia ovifera", "Uncommon"],
  ["Sea Peach", "Halocynthia pyriformis", "Uncommon"],
  ["Sea Vase", "Ciona intestinalis", "Common"],
  ["Blood Drop Tunicate", "Botryllus schlosseri", "Common"],
  ["Club Tunicate", "Styela clava", "Common"],
  ["Orange Sheath Tunicate", "Botrylloides violaceus", "Uncommon"],
  ["Golden Star Tunicate", "Botryllus schlosseri", "Common"],
  ["Tunicate (Diplosoma listerianum)", "Diplosoma listerianum", "Uncommon"],
  ["Appendicularian", "Oikopleura dioica", "Rare"],
  ["Blue Shark", "Prionace glauca", "Uncommon"],
  ["Basking Shark", "Cetorhinus maximus", "Rare"],
  ["Atlantic Torpedo", "Torpedo nobiliana", "Rare"],
  ["Winter Skate", "Leucoraja ocellata", "Common"],
  ["Clearnose Skate", "Raja eglanteria", "Uncommon"],
  ["American Eel", "Anguilla rostrata", "Common"],
  ["Atlantic Menhaden", "Brevoortia tyrannus", "Common"],
  ["Red Hake", "Urophycis chuss", "Common"],
  ["Spotted Hake", "Urophycis regia", "Uncommon"],
  ["Tomcod", "Microgadus tomcod", "Common"],
  ["Oyster Toadfish", "Opsanus tau", "Common"],
  ["Goosefish", "Lophius americanus", "Uncommon"],
  ["Northern Pipefish", "Syngnathus fuscus", "Common"],
  ["Lined Seahorse", "Hippocampus erectus", "Rare"],
  ["Acadian Redfish", "Sebastes fasciatus", "Uncommon"],
  ["Striped Searobin", "Prionotus evolans", "Common"],
  ["Northern Searobin", "Prionotus carolinus", "Common"],
  ["Longhorn Sculpin", "Myoxocephalus octodecemspinosus", "Common"],
  ["Grubby", "Myoxocephalus aenaeus", "Common"],
  ["Shorthorn Sculpin", "Myoxocephalus scorpius", "Common"],
  ["Sea Raven", "Hemitripterus americanus", "Common"],
  ["Alligatorfish", "Aspidophoroides monopterygius", "Rare"],
  ["Lumpfish", "Cyclopterus lumpus", "Uncommon"],
  ["Atlantic Spiny Lumpsucker", "Eumicrotremus spinosus", "Rare"],
  ["Inquiline Snailfish", "Liparis inquilinus", "Rare"],
  ["Variegated Snailfish", "Liparis gibbus", "Rare"],
  ["Black Sea Bass", "Centropristis striata", "Common"],
  ["Cobia", "Rachycentron canadum", "Rare"],
  ["Mackerel Scad", "Decapterus macarellus", "Uncommon"],
  ["Sheepshead", "Archosargus probatocephalus", "Uncommon"],
  ["Scup", "Stenotomus chrysops", "Common"],
  ["Tautog", "Tautoga onitis", "Common"],
  ["Cunner", "Tautogolabrus adspersus", "Common"],
  ["Ocean Pout", "Zoarces americanus", "Common"],
  ["Snakeblenny", "Lumpenus lampretaeformis", "Rare"],
  ["Arctic Shanny", "Stichaeus punctatus", "Rare"],
  ["Radiated Shanny", "Ulvaria subbifurcata", "Uncommon"],
  ["Rock Gunnel", "Pholis gunnellus", "Common"],
  ["Atlantic Wolffish", "Anarhichas lupus", "Uncommon"],
  ["American Sand Lance", "Ammodytes americanus", "Common"],
  ["Windowpane Flounder", "Scophthalmus aquosus", "Common"],
  ["Summer Flounder", "Paralichthys dentatus", "Common"],
  ["Fourspot Flounder", "Hippoglossina oblonga", "Uncommon"],
  ["American Plaice", "Hippoglossoides platessoides", "Uncommon"],
  ["Gray Triggerfish", "Balistes capriscus", "Uncommon"],
  ["Northern Puffer", "Sphoeroides maculatus", "Common"],
  ["Ocean Sunfish", "Mola mola", "Rare"],
];

const CRUSTACEANS = [
  ["American Lobster", "Homarus americanus", "Common"],
  ["Atlantic Rock Crab", "Cancer irroratus", "Common"],
  ["Jonah Crab", "Cancer borealis", "Common"],
  ["Blue Crab", "Callinectes sapidus", "Common"],
  ["Green Crab", "Carcinus maenas", "Common"],
  ["Horseshoe Crab", "Limulus polyphemus", "Common"],
  ["Northern Krill", "Meganyctiphanes norvegica", "Uncommon"],
  ["Acorn Barnacle", "Semibalanus balanoides", "Common"],
  ["Lentil Sea Spider", "Anoplodactylus lentus", "Rare"],
  ["Anemone Sea Spider", "Pycnogonum litorale", "Uncommon"],
  ["Baltic Isopod", "Idotea balthica", "Common"],
  ["Hedgehog Amphipod", "Gammarus oceanicus", "Uncommon"],
  ["Portly Spider Crab", "Libinia emarginata", "Common"],
  ["Arctic Lyre Crab", "Hyas coarctatus", "Uncommon"],
  ["Atlantic Sand Crab", "Emerita talpoida", "Common"],
  ["Ocellate Lady Crab", "Ovalipes ocellatus", "Common"],
  ["Snow Crab", "Chionoecetes opilio", "Uncommon"],
  ["Norway King Crab", "Lithodes maja", "Rare"],
  ["Atlantic Fiddler Crab", "Uca pugnax", "Common"],
];

const CRUSTACEAN_GROUPS = [
  { name: "Barnacle", variants: [
    ["Northern Rock Barnacle", "Semibalanus balanoides", "Common"],
    ["Rough Barnacle", "Balanus crenatus", "Common"],
    ["Ivory Barnacle", "Balanus eburneus", "Uncommon"],
  ]},
  { name: "Shrimp", variants: [
    ["Skeleton Shrimp", "Caprella linearis", "Common"],
    ["Mysid Shrimp", "Neomysis americana", "Common"],
    ["Sand Shrimp", "Crangon septemspinosa", "Common"],
    ["Sculptured Shrimp", "Sclerocrangon boreas", "Rare"],
    ["Aesop Shrimp", "Pandalus montagui", "Uncommon"],
    ["Polar Lebbeid", "Lebbeus polaris", "Rare"],
    ["Spiny Lebbeid Shrimp", "Lebbeus groenlandicus", "Rare"],
    ["Zebra Lebbeid", "Lebbeus microceros", "Rare"],
  ]},
  { name: "Hermit Crab", variants: [
    ["Hairy Hermit Crab", "Pagurus arcuatus", "Uncommon"],
    ["Longwrist Hermit Crab", "Pagurus longicarpus", "Common"],
    ["Acadian Hermit Crab", "Pagurus acadianus", "Common"],
  ]},
];

const ECHINODERMS = [
  ["Forbes Sea Star", "Asterias forbesi", "Common"],
  ["Northern Sea Star", "Asterias rubens", "Common"],
  ["Green Sea Urchin", "Strongylocentrotus droebachiensis", "Common"],
  ["Sand Dollar", "Echinarachnius parma", "Common"],
  ["Orange-Footed Sea Cucumber", "Cucumaria frondosa", "Uncommon"],
  ["Basket Star", "Gorgonocephalus arcticus", "Rare"],
  ["Scarlet Psolus", "Psolus fabricii", "Rare"],
  ["Brown Psolus", "Psolus phantapus", "Uncommon"],
  ["Hairy Sea Cucumber", "Sclerodactyla briareus", "Uncommon"],
  ["Silky Sea Cucumber", "Chiridota laevis", "Uncommon"],
  ["Purple-Spined Sea Urchin", "Arbacia punctulata", "Common"],
  ["Smooth Sunstar", "Solaster endeca", "Rare"],
  ["Spiny Sunstar", "Crossaster papposus", "Uncommon"],
  ["Blood Star", "Henricia sanguinolenta", "Common"],
  ["Polar Sea Star", "Leptasterias polaris", "Uncommon"],
  ["Green Slender Sea Star", "Leptasterias tenera", "Rare"],
  ["Horse Star", "Hippasteria phrygiana", "Rare"],
  ["Badge Star", "Poraniomorpha hispida", "Rare"],
  ["Winged Sea Star", "Pteraster militaris", "Rare"],
  ["Daisy Brittle Star", "Ophiopholis aculeata", "Common"],
];

const CNIDARIANS_SINGLE = [
  ["Tubularian Hydroid", "Ectopleura larynx", "Common"],
  ["Hydroid (Candelabrum phrygium)", "Candelabrum phrygium", "Rare"],
  ["Solitary Hydroid", "Corymorpha pendula", "Uncommon"],
  ["Snail Fur", "Hydractinia echinata", "Common"],
  ["Knotted Thread Hydroid", "Eudendrium ramosum", "Uncommon"],
  ["Leptomedusa", "Leptomedusae", "Uncommon"],
  ["Siphonophore", "Siphonophorae", "Rare"],
  ["Portuguese Man-of-War", "Physalia physalis", "Rare"],
  ["Lion's Mane Jellyfish", "Cyanea capillata", "Common"],
  ["Moon Jellyfish", "Aurelia aurita", "Common"],
  ["Eared Stalked Jellyfish", "Haliclystus auricula", "Rare"],
  ["Trumpet Stalked Jellyfish", "Calvadosia campanulata", "Rare"],
  ["Horn Stalked Jellyfish", "Haliclystus salpinx", "Rare"],
  ["Dead Man's Fingers", "Alcyonium digitatum", "Common"],
  ["Sea Strawberry Soft Coral", "Gersemia rubiformis", "Uncommon"],
  ["Northern Star Coral", "Astrangia poculata", "Uncommon"],
  ["Northern Cerianthid", "Cerianthus borealis", "Uncommon"],
];

const CNIDARIAN_GROUPS = [
  {
    name: "Hydromedusa",
    variants: [
      ["Clapper Hydromedusa", "Staurophora mertensii", "Rare"],
      ["Many-Armed Hydromedusa", "Aequorea forskalea", "Rare"],
      ["Manyribbed Hydromedusa", "Aequorea macrodactyla", "Rare"],
      ["White Cross Hydromedusa", "Mitrocomella polydiademata", "Rare"],
      ["Eight Ribbed Hydromedusa", "Melicertum octocostatum", "Rare"],
      ["Hydromedusa (Ptychogena lactea)", "Ptychogena lactea", "Very Rare"],
      ["Elegant Hydromedusa", "Phialidium elegans", "Rare"],
    ],
  },
  {
    name: "Anemone",
    variants: [
      ["Lined Anemone", "Fagesia lineata", "Uncommon"],
      ["Silver-spotted Anemone", "Bunodactis stella", "Rare"],
      ["Northern Red Anemone", "Urticina felina", "Common"],
      ["Swimming Anemone", "Stomphia coccinea", "Rare"],
      ["Clonal Plumose Anemone", "Metridium senile", "Common"],
      ["White Anemone", "Diadumene leucolena", "Uncommon"],
      ["Rugose Anemone", "Urticina crassicornis", "Uncommon"],
      ["Burrowing Anemone", "Edwardsia elegans", "Uncommon"],
    ],
  },
];

const WORMS_OTHER_SINGLE = [
  ["Lugworm", "Arenicola marina", "Common"],
  ["Bloodworm", "Glycera dibranchiata", "Common"],
  ["Finger Sponge", "Haliclona oculata", "Common"],
  ["Breadcrumb Sponge", "Halichondria panicea", "Common"],
  ["Sponge (Polymastia mammillaris)", "Polymastia mammillaris", "Uncommon"],
  ["Sponge (Halichondria sitiens)", "Halichondria sitiens", "Uncommon"],
  ["Purple Sponge", "Haliclona permollis", "Uncommon"],
  ["Boring Sponge", "Cliona celata", "Common"],
  ["Red Beard Sponge", "Microciona prolifera", "Common"],
  ["Palmate Sponge", "Isodictya palmata", "Uncommon"],
  ["Warty Sponge", "Myxilla fimbriata", "Rare"],
  ["Chalice Sponge", "Mycale lingua", "Rare"],
  ["Chevron Amphiporus", "Amphiporus angulatus", "Uncommon"],
  ["Northern Lamp Shell", "Terebratulina septentrionalis", "Rare"],
  ["Spiral-tufted Bryozoan", "Bugula turrita", "Uncommon"],
  ["Sea Lace", "Electra pilosa", "Common"],
  ["Red Crust", "Cryptosula pallasiana", "Common"],
  ["Ellis' Bryozoan", "Flustra foliacea", "Uncommon"],
];

const WORMS_OTHER_GROUPS = [
  {
    name: "Comb Jelly",
    variants: [
      ["Sea Gooseberry", "Pleurobrachia pileus", "Common"],
      ["Northern Comb Jelly", "Bolinopsis infundibulum", "Uncommon"],
      ["Sea Walnut", "Mnemiopsis leidyi", "Common"],
      ["Beroe's Comb Jelly", "Beroe cucumis", "Uncommon"],
    ],
  },
  {
    name: "Errant Worms",
    variants: [
      ["Leafy Paddle Worm", "Phyllodoce mucosa", "Common"],
      ["Plankton Worm", "Tomopteris helgolandica", "Rare"],
      ["Twelve-Scaled Worm", "Lepidonotus squamatus", "Common"],
      ["Fifteen-Scaled Worm", "Harmothoe imbricata", "Common"],
      ["Clam Worm", "Alitta virens", "Common"],
      ["Eyed-Fringed Worm", "Eteone lactea", "Uncommon"],
      ["Johnston's Ornate Worm", "Eumida sanguinea", "Uncommon"],
    ],
  },
  {
    name: "Sedentary Worms",
    variants: [
      ["Red Terebellid Worm", "Eupolymnia nebulosa", "Uncommon"],
      ["Terebellid Worm", "Terebellidae", "Common"],
      ["Bamboo Worm", "Clymenella torquata", "Common"],
      ["Sabellid Worm", "Sabella pavonina", "Common"],
      ["Slime Worm", "Myxicola infundibulum", "Uncommon"],
      ["Sinistral Spiral Tube Worm", "Spirorbis spirorbis", "Common"],
      ["Lacy Tube Worm", "Filograna implexa", "Uncommon"],
      ["Spoon Worm", "Echiurus echiurus", "Rare"],
    ],
  },
];

const MOLLUSK_SINGLE = [
  ["Plate Limpet", "Tectura testudinalis", "Common"],
  ["Common Periwinkle", "Littorina littorea", "Common"],
  ["Rough Periwinkle", "Littorina saxatilis", "Common"],
  ["Yellow Periwinkle", "Littorina obtusata", "Uncommon"],
  ["Moon Snail", "Euspira heros", "Common"],
  ["Shark Eye", "Neverita duplicata", "Uncommon"],
  ["Atlantic Oyster Drill", "Urosalpinx cinerea", "Common"],
  ["Atlantic Dogwinkle", "Nucella lapillus", "Common"],
  ["Stimpson's Colus", "Colus stimpsoni", "Rare"],
  ["Boreal Topsnail", "Margarites helicinus", "Uncommon"],
  ["Naked Sea Butterfly", "Clione limacina", "Rare"],
  ["Eastern Oyster", "Crassostrea virginica", "Common"],
  ["Common Jingle", "Anomia simplex", "Common"],
  ["Great Piddock", "Zirfaea crispata", "Uncommon"],
  ["Blood Ark", "Anadara ovalis", "Uncommon"],
  ["Northern Cyclocardia", "Cyclocardia borealis", "Uncommon"],
  ["Wavy Astarte", "Astarte undata", "Uncommon"],
  ["Arctic Wedgeclam", "Mesodesma arctatum", "Uncommon"],
  ["Rounded Pandora", "Pandora gouldiana", "Rare"],
  ["Longfin Inshore Squid", "Doryteuthis pealeii", "Common"],
];

const MOLLUSK_GROUPS = [
  { name: "Chiton", variants: [
    ["Mottled Chiton", "Tonicella marmorea", "Common"],
    ["Dressed Chiton", "Ischnochiton albus", "Uncommon"],
    ["Eastern Beaded Chiton", "Chaetopleura apiculata", "Uncommon"],
  ]},
  { name: "Wentletrap", variants: [
    ["Brown-band Wentletrap", "Epitonium rupicola", "Uncommon"],
    ["Greenland Wentletrap", "Epitonium greenlandicum", "Rare"],
  ]},
  { name: "Slippersnail", variants: [
    ["Common Slippersnail", "Crepidula fornicata", "Common"],
    ["Eastern White Slippersnail", "Crepidula plana", "Uncommon"],
  ]},
  { name: "Mudsnail", variants: [
    ["Threeline Mudsnail", "Ilyanassa trivittata", "Common"],
    ["Eastern Mudsnail", "Ilyanassa obsoleta", "Common"],
  ]},
  { name: "Whelk", variants: [
    ["Waved Whelk", "Buccinum undatum", "Common"],
    ["Wrinkled Whelk", "Buccinum tenue", "Uncommon"],
    ["Channeled Whelk", "Busycotypus canaliculatus", "Common"],
    ["Knobbed Whelk", "Busycon carica", "Common"],
  ]},
  { name: "Cadlina", variants: [
    ["Yellow-edge Cadlina", "Cadlina luteomarginata", "Rare"],
    ["White Atlantic Cadlina", "Cadlina laevis", "Rare"],
  ]},
  { name: "Doris", variants: [
    ["Barnacle-eating Onchidoris", "Onchidoris muricata", "Uncommon"],
    ["Fuzzy Onchidoris", "Onchidoris bilamellata", "Uncommon"],
    ["Hairy Spiny Doris", "Acanthodoris pilosa", "Rare"],
    ["Yellow False Doris", "Doriopsilla albolineata", "Rare"],
  ]},
  { name: "Nudibranch", variants: [
    ["Rim-backed Nudibranch", "Doto coronata", "Rare"],
    ["Atlantic Ancula", "Ancula gibbosa", "Rare"],
    ["Frond Aeolis Nudibranch", "Dendronotus frondosus", "Uncommon"],
    ["Robust Frond Aeolis", "Dendronotus robustus", "Rare"],
    ["Dwarf Balloon Aeolis", "Eubranchus pallidus", "Rare"],
    ["Pellucid Aeolis", "Eubranchus pellucidus", "Uncommon"],
    ["Red-finger Aeolis", "Flabellina verrucosa", "Uncommon"],
    ["Aeolis Nudibranch", "—", "Uncommon"],
    ["Salmon Aeolis", "Flabellina salmonacea", "Rare"],
    ["Shag-rug Aeolis", "Aeolidia papillosa", "Rare"],
    ["Green Balloon Aeolis", "Eubranchus rupium", "Rare"],
    ["Painted Balloon Aeolis", "Eubranchus sp.", "Very Rare"],
    ["Orange-tip Cuthona", "Cuthona amoena", "Rare"],
    ["Nudibranch (Cuthona pustulata)", "Cuthona pustulata", "Rare"],
    ["Nudibranch (Doto formosa)", "Doto formosa", "Rare"],
    ["Winged Thecacera", "Thecacera pennigera", "Very Rare"],
    ["Nudibranch (Okenia ascidicola)", "Okenia ascidicola", "Very Rare"],
  ]},
  { name: "Mussel", variants: [
    ["Blue Mussel", "Mytilus edulis", "Common"],
    ["Ribbed Mussel", "Geukensia demissa", "Common"],
    ["Northern Horse Mussel", "Modiolus modiolus", "Uncommon"],
    ["Black Mussel", "Mytilus trossulus", "Uncommon"],
  ]},
  { name: "Scallop", variants: [
    ["Iceland Scallop", "Chlamys islandica", "Rare"],
    ["Sea Scallop", "Placopecten magellanicus", "Common"],
    ["Bay Scallop", "Argopecten irradians", "Common"],
  ]},
  { name: "Quahog", variants: [
    ["Ocean Quahog", "Arctica islandica", "Uncommon"],
    ["Northern Quahog", "Mercenaria mercenaria", "Common"],
  ]},
  { name: "Clam", variants: [
    ["Atlantic Surfclam", "Spisula solidissima", "Common"],
    ["Greenland Smoothcockle", "Serripes groenlandicus", "Uncommon"],
    ["Atlantic Razorclam", "Ensis leei", "Common"],
    ["Softshell Clam", "Mya arenaria", "Common"],
    ["Truncate Softshell Clam", "Mya truncata", "Uncommon"],
  ]},
];

function buildSingle(list, phylum) {
  return list.map(([name, latin, rarity]) => ({
    id: `${phylum}__${slug(name)}`, name, latin, rarity, phylum, region: "north-atlantic",
  }));
}
function buildGroups(groups, phylum) {
  // Flattened: every variant becomes its own standalone species row.
  // IDs keep the original group__variant shape so anyone's saved
  // progress under the old grouped IDs still matches up.
  return groups.flatMap((g) =>
    g.variants.map(([vn, vl, vr]) => ({
      id: `${phylum}__group-${slug(g.name)}__${slug(vn)}`, name: vn, latin: vl, rarity: vr, phylum, region: "north-atlantic",
    }))
  );
}

const DEFAULT_SPECIES = [
  ...buildSingle(FISH_VERTEBRATES, "fish-vertebrates"),
  ...buildSingle(MOLLUSK_SINGLE, "mollusks"),
  ...buildGroups(MOLLUSK_GROUPS, "mollusks"),
  ...buildSingle(CRUSTACEANS, "crustaceans"),
  ...buildGroups(CRUSTACEAN_GROUPS, "crustaceans"),
  ...buildSingle(ECHINODERMS, "echinoderms"),
  ...buildSingle(CNIDARIANS_SINGLE, "cnidarians"),
  ...buildGroups(CNIDARIAN_GROUPS, "cnidarians"),
  ...buildSingle(WORMS_OTHER_SINGLE, "worms-other"),
  ...buildGroups(WORMS_OTHER_GROUPS, "worms-other"),
];

const STORAGE_KEY = "reef-ledger-data";

/* ---------------------------------------------------------
   Reference photos — optional, keyed by exact species name.
   Add one entry per species as you find a suitable photo on
   Wikimedia Commons (or another source with a clear license).
   `url` should be the direct image file link (the "Original
   file" link on the Commons file page, ending in .jpg/.png),
   not the page you view it on.

   Example:
   "Atlantic Cod": {
     url: "https://upload.wikimedia.org/wikipedia/commons/x/xx/Example.jpg",
     author: "Jane Diver",
     license: "CC BY-SA 4.0",
     licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
     sourceUrl: "https://commons.wikimedia.org/wiki/File:Example.jpg",
   },
--------------------------------------------------------- */
// Only this Firebase user can add/edit the shared default species photos.
// Replace with your actual UID from Firebase console → Authentication → Users.
const ADMIN_UID = "6t0yOgtzKkTEzJwV8xneI6cy1Cl1";

const PHOTO_CREDITS = {
  // add entries here
};

/* ---------------------------------------------------------
   Placeholder silhouette icons per phylum
--------------------------------------------------------- */
function FishIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M6 24c6-9 16-13 26-13 5 0 9 2 12 5-3 3-4 5-4 8s1 5 4 8c-3 3-7 5-12 5-10 0-20-4-26-13z" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M44 24l4-6v12l-4-6z" fill="currentColor" />
      <circle cx="16" cy="21" r="1.6" fill="currentColor" />
    </svg>
  );
}
function ShellIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M10 34c0-14 6-22 14-22s14 8 14 22" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M24 12v22M18 15c2 6 2 13 0 19M30 15c-2 6-2 13 0 19" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 34h28" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
function CrabIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <ellipse cx="24" cy="24" rx="12" ry="8" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M12 20L4 14M12 28L4 34M36 20l8-6M36 28l8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 12c-2 0-3 1-3 3M42 12c2 0 3 1 3 3M6 36c-2 0-3-1-3-3M42 36c2 0 3-1 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M15 19l-4-6M33 19l4-6M15 29l-4 6M33 29l4 6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function StarIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M24 6l4.5 12.5L41 20l-9.5 9 3 13L24 35l-10.5 7 3-13L7 20l12.5-1.5z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}
function JellyIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M12 20a12 10 0 0 1 24 0z" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M12 20c2 6 1 8 0 10M18 21c1 7 0 9-1 12M24 21v14M30 21c-1 7 0 9 1 12M36 20c-2 6-1 8 0 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function WormIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M6 30c4-8 6-16 4-22M10 8c6 2 9 8 7 15M17 23c4 3 4 9 0 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 34c6 4 14 4 20-2s14-4 18 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
const PHYLUM_ICON = {
  "fish-vertebrates": FishIcon, "mollusks": ShellIcon, "crustaceans": CrabIcon,
  "echinoderms": StarIcon, "cnidarians": JellyIcon, "worms-other": WormIcon,
};

/* ---------------------------------------------------------
   Theme
--------------------------------------------------------- */
const THEMES = {
  real: {
    label: "Real",
    headingFont: "'Fraunces', serif",
    bodyFont: "'Inter', sans-serif",
    monoFont: "'IBM Plex Mono', monospace",
    bg: "#0E2626", bgIsGradient: false,
    panel: "#0A1D1D", panelAlt: "#0E2626",
    border: "#547368", borderWidth: 1,
    text: "#EAE3D2", textDim: "#547368",
    accent: "#8FBFAE", coral: "#E4572E",
    radius: 8, radiusLg: 16, radiusPill: 8,
    shadow: "none", buttonShadow: "none", letterSpacing: "0.04em",
  },
};

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap');`;

const TIER_COLOR = {
  platinum: { fill: "#E8F1F2", ring: "#5D7A82" },
  gold: { fill: "#F1C232", ring: "#B8860B" },
  silver: { fill: "#D6DBE0", ring: "#8A9BA8" },
  bronze: { fill: "#CD8A4A", ring: "#8A5A2B" },
  locked: { fill: "transparent", ring: "#6B7C74" },
};
const TIER_THRESHOLDS = [
  { tier: "locked", label: "Locked", desc: "0–24% found" },
  { tier: "bronze", label: "Bronze", desc: "25–49% found" },
  { tier: "silver", label: "Silver", desc: "50–74% found" },
  { tier: "gold", label: "Gold", desc: "75–99% found" },
  { tier: "platinum", label: "Platinum", desc: "100% found" },
];
function getTier(found, total) {
  if (!total) return "locked";
  const pct = (found / total) * 100;
  if (pct >= 100) return "platinum";
  if (pct >= 75) return "gold";
  if (pct >= 50) return "silver";
  if (pct >= 25) return "bronze";
  return "locked";
}

/* ---------------------------------------------------------
   Helpers
--------------------------------------------------------- */
function compressImage(file, maxDim = 700, quality = 0.6) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not load image"));
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDim) { height = Math.round((height * maxDim) / width); width = maxDim; }
        else if (height > maxDim) { width = Math.round((width * maxDim) / height); height = maxDim; }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
function todayStr() { return new Date().toISOString().slice(0, 10); }

function RarityTag({ rarity, styles }) {
  if (!rarity) return null;
  const c = RARITY_COLOR[rarity] || RARITY_COLOR["Common"];
  return <span style={{ ...styles.rarityTag, background: c.bg, color: c.fg }}>{rarity}</span>;
}

function MedalBadge({ tier, size = 46 }) {
  const c = TIER_COLOR[tier];
  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 48 56">
      <path d="M14 26l-6 22 16-8 16 8-6-22" fill={tier === "locked" ? "none" : c.fill} stroke={c.ring} strokeWidth="2" strokeLinejoin="round" opacity={tier === "locked" ? 0.5 : 1} />
      <circle cx="24" cy="20" r="16" fill={tier === "locked" ? "none" : c.fill} stroke={c.ring} strokeWidth="2.5" />
      {tier === "locked" ? (
        <Lock x="17" y="13" width="14" height="14" color={c.ring} strokeWidth={2} />
      ) : (
        <circle cx="24" cy="20" r="10" fill="none" stroke={c.ring} strokeWidth="1.5" opacity="0.5" />
      )}
    </svg>
  );
}

/* ---------------------------------------------------------
   Main component
--------------------------------------------------------- */
export default function ReefLedger({ user, onSignOut }) {
  const [records, setRecords] = useState({});
  const [customSpecies, setCustomSpecies] = useState([]);
  const [themeName] = useState("real");
  const [loaded, setLoaded] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [sharedPhotos, setSharedPhotos] = useState({});

  const [selectedRegion, setSelectedRegion] = useState(REGIONS[0].id);
  const [selectedPhylum, setSelectedPhylum] = useState("all");
  const [search, setSearch] = useState("");
  const [foundOnly, setFoundOnly] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [mapPhylum, setMapPhylum] = useState(null);

  const t = THEMES[themeName];
  const styles = useMemo(() => getStyles(t), [themeName]);

  const allSpecies = useMemo(() => [...DEFAULT_SPECIES, ...customSpecies], [customSpecies]);

  const flatSpecies = allSpecies;

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          setRecords(data.records || {});
          setCustomSpecies(data.customSpecies || []);
        }
      } catch (err) {
        setSaveError("Couldn't load your saved data. Check your connection and refresh.");
      } finally {
        setLoaded(true);
      }
    })();
  }, [user.uid]);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(db, "speciesPhotos"));
        const map = {};
        snap.forEach((d) => { map[d.id] = d.data(); });
        setSharedPhotos(map);
      } catch (err) {
        // shared photo library is optional — fail quietly
      }
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    (async () => {
      try {
        await setDoc(doc(db, "users", user.uid), { records, customSpecies });
        setSaveError(null);
      } catch (err) {
        setSaveError("Couldn't save — your changes may not persist. Check your connection.");
      }
    })();
  }, [records, customSpecies, loaded, user.uid]);

  const regionSpeciesFlat = flatSpecies.filter((s) => s.region === selectedRegion);
  const foundCountRegion = regionSpeciesFlat.filter((s) => records[s.id]?.found).length;

  const filtered = allSpecies.filter((s) => {
    if (s.region !== selectedRegion) return false;
    if (selectedPhylum !== "all" && s.phylum !== selectedPhylum) return false;
    if (foundOnly && !records[s.id]?.found) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const phylumStats = PHYLA.map((p) => {
    const list = regionSpeciesFlat.filter((s) => s.phylum === p.id);
    const found = list.filter((s) => records[s.id]?.found).length;
    return { ...p, total: list.length, found, tier: getTier(found, list.length) };
  });

  function toggleFound(id) {
    setRecords((prev) => {
      const existing = prev[id] || {};
      const nowFound = !existing.found;
      return { ...prev, [id]: { ...existing, found: nowFound, date: nowFound ? existing.date || todayStr() : existing.date } };
    });
  }
  function updateRecord(id, patch) {
    setRecords((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), ...patch } }));
  }
  function addCustomSpecies({ name, latin, phylum, rarity }) {
    const id = "c" + Date.now();
    setCustomSpecies((prev) => [...prev, { id, name, latin, phylum, rarity, region: selectedRegion }]);
    setShowAddForm(false);
  }
  function removeCustomSpecies(id) {
    setCustomSpecies((prev) => prev.filter((s) => s.id !== id));
    setRecords((prev) => { const next = { ...prev }; delete next[id]; return next; });
    setSelectedId(null);
  }
  async function handleReset() {
    try {
      await setDoc(doc(db, "users", user.uid), { records: {}, customSpecies: [] });
    } catch (err) {}
    setRecords({});
    setCustomSpecies([]);
    setShowResetConfirm(false);
  }

  const selected = flatSpecies.find((s) => s.id === selectedId) || customSpecies.find((s) => s.id === selectedId);
  const currentPhylumName = selectedPhylum === "all" ? "All" : (PHYLA.find((p) => p.id === selectedPhylum)?.name || "");

  return (
    <div style={styles.app}>
      <style>{FONT_IMPORT}</style>
      <div style={styles.panel}>

      <header style={styles.header}>
        <button style={styles.iconBtn} onClick={() => { setShowAchievements(true); setMapPhylum(null); }} title="Achievements">
          <Award size={20} />
        </button>

        <div style={styles.headerCenter}>
          <div style={styles.eyebrow}>PERSONAL OCEAN SPECIES LOG</div>
          <h1 style={styles.title}>Reef Ledger</h1>
        </div>

        <div style={styles.headerRight}>
          <div style={styles.stampGroup}>
            <div style={styles.stamp}>
              <div style={styles.stampCount}>{foundCountRegion}</div>
              <div style={styles.stampTotal}>/ {regionSpeciesFlat.length}</div>
            </div>
            <div style={styles.stampCaption}>Species<br />Discovered</div>
          </div>
          <button style={styles.iconBtn} onClick={() => setShowSettings(true)} title="Settings">
            <Settings size={20} />
          </button>
        </div>
      </header>

      <div style={styles.regionTabs}>
        {REGIONS.map((r) => (
          <button key={r.id} onClick={() => setSelectedRegion(r.id)} style={{ ...styles.regionTab, ...(selectedRegion === r.id ? styles.regionTabActive : {}) }}>
            <div style={styles.regionTabName}>{r.name}</div>
            <div style={styles.regionTabSub}>{r.subtitle}</div>
          </button>
        ))}
        <button style={styles.regionTabGhost} disabled title="More regions coming later">
          <Plus size={14} /> More regions soon
        </button>
      </div>

      <div style={styles.phylumTabs}>
        <button onClick={() => setSelectedPhylum("all")} style={{ ...styles.phylumTab, ...(selectedPhylum === "all" ? styles.phylumTabActive : {}) }}>
          All
        </button>
        {PHYLA.map((p) => (
          <button key={p.id} onClick={() => setSelectedPhylum(p.id)} style={{ ...styles.phylumTab, ...(selectedPhylum === p.id ? styles.phylumTabActive : {}) }}>
            {p.name}
          </button>
        ))}
      </div>

      <div style={styles.toolbar}>
        <div style={styles.searchBox}>
          <Search size={16} color={t.accent} />
          <input style={styles.searchInput} placeholder={`Search ${currentPhylumName.toLowerCase()}…`} value={search} onChange={(e) => setSearch(e.target.value)} />
          {search && <X size={15} color={t.accent} style={{ cursor: "pointer" }} onClick={() => setSearch("")} />}
        </div>
        <button style={{ ...styles.toggleChip, ...(foundOnly ? styles.toggleChipActive : {}) }} onClick={() => setFoundOnly((v) => !v)}>
          <Check size={13} /> Found only
        </button>
      </div>

      <main style={styles.list}>
        {filtered.length === 0 && (
          <div style={styles.empty}>Nothing here yet. Try a different search, or log a species you've spotted that isn't on the list.</div>
        )}
        {filtered.map((s) => {
          const PlaceholderIcon = PHYLUM_ICON[s.phylum] || FishIcon;

          const rec = records[s.id];
          const isCustom = s.id.startsWith("c");
          const credit = sharedPhotos[slug(s.name)] || PHOTO_CREDITS[s.name];
          const thumb = rec?.photos?.[0] || credit?.url;
          return (
            <div key={s.id} style={styles.row} onClick={() => setSelectedId(s.id)}>
              <div style={{ ...styles.stampButton, ...(rec?.found ? styles.stampButtonActive : {}) }} onClick={(e) => { e.stopPropagation(); toggleFound(s.id); }}>
                {rec?.found ? <Check size={15} strokeWidth={3} /> : null}
              </div>
              <div style={styles.rowText}>
                <div style={styles.rowName}>
                  {s.name}
                  {isCustom && <span style={styles.customTag}>added</span>}
                  <RarityTag rarity={s.rarity} styles={styles} />
                </div>
                <div style={styles.rowLatin}>{s.latin}</div>
                {rec?.found && rec?.date && <div style={styles.metaDate}>{rec.date}</div>}
              </div>
              <div
                style={styles.rowThumb}
                onClick={(e) => { if (thumb) { e.stopPropagation(); setLightbox({ url: thumb, credit }); } }}
              >
                {thumb ? <img src={thumb} style={styles.rowThumbImg} alt="" /> : <PlaceholderIcon style={styles.rowThumbIcon} />}
              </div>
            </div>
          );
        })}
        <button style={styles.addRow} onClick={() => setShowAddForm(true)}>
          <Plus size={15} /> Log a species not on this list
        </button>
        <div style={styles.footerRow}>
          {saveError && <span style={styles.saveError}>{saveError}</span>}
          <button style={styles.resetLink} onClick={() => setShowResetConfirm(true)}><RotateCcw size={12} /> Reset all data</button>
        </div>
      </main>

      </div>

      {lightbox && (
        <Lightbox styles={styles} url={lightbox.url} credit={lightbox.credit} onClose={() => setLightbox(null)} />
      )}

      {selected && (
        <DetailModal
          styles={styles} t={t}
          species={selected} record={records[selected.id] || {}}
          onClose={() => setSelectedId(null)}
          onUpdate={(patch) => updateRecord(selected.id, patch)}
          onToggleFound={() => toggleFound(selected.id)}
          onDeleteCustom={selected.id.startsWith("c") ? () => removeCustomSpecies(selected.id) : null}
          sharedPhotos={sharedPhotos}
          isAdmin={user.uid === ADMIN_UID}
          onSaveSharedPhoto={async (name, data) => {
            const key = slug(name);
            await setDoc(doc(db, "speciesPhotos", key), { name, ...data });
            setSharedPhotos((prev) => ({ ...prev, [key]: { name, ...data } }));
          }}
        />
      )}

      {showAddForm && (
        <AddSpeciesModal styles={styles} defaultPhylum={selectedPhylum === "all" ? PHYLA[0].id : selectedPhylum} onClose={() => setShowAddForm(false)} onAdd={addCustomSpecies} />
      )}

      {showResetConfirm && (
        <ConfirmModal styles={styles} message="This clears every sighting, note, and photo you've logged. This can't be undone." onCancel={() => setShowResetConfirm(false)} onConfirm={handleReset} />
      )}

      {showAchievements && (
        <AchievementsModal
          styles={styles} t={t}
          phylumStats={phylumStats}
          mapPhylum={mapPhylum}
          setMapPhylum={setMapPhylum}
          allSpeciesForPhylum={(pid) => regionSpeciesFlat.filter((s) => s.phylum === pid)}
          records={records}
          onClose={() => { setShowAchievements(false); setMapPhylum(null); }}
        />
      )}

      {showSettings && (
        <SettingsModal styles={styles} onClose={() => setShowSettings(false)} userEmail={user.email} onSignOut={onSignOut} />
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   Achievements + Collection grid
--------------------------------------------------------- */
function AchievementsModal({ styles, t, phylumStats, mapPhylum, setMapPhylum, allSpeciesForPhylum, records, onClose }) {
  if (mapPhylum) {
    const phylum = phylumStats.find((p) => p.id === mapPhylum);
    const species = allSpeciesForPhylum(mapPhylum);
    const found = species.filter((s) => records[s.id]?.found).length;
    const pct = species.length ? Math.round((found / species.length) * 100) : 0;
    const PlaceholderIcon = PHYLUM_ICON[mapPhylum] || FishIcon;
    return (
      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          <button style={styles.closeBtn} onClick={onClose}><X size={18} /></button>
          <button style={styles.backBtn} onClick={() => setMapPhylum(null)}><ArrowLeft size={15} /> All achievements</button>
          <div style={styles.modalTitle}>{phylum.name}</div>
          <div style={styles.progressTrack}>
            <div style={{ ...styles.progressFill, width: `${pct}%` }} />
          </div>
          <div style={styles.progressLabel}>{found} / {species.length} discovered — {pct}%</div>
          <div style={styles.mapGrid}>
            {species.map((s) => {
              const rec = records[s.id];
              const thumb = rec?.photos?.[0];
              return (
                <div key={s.id} style={styles.mapTile} title={rec?.found ? s.name : "Not yet found"}>
                  <div style={{ ...styles.mapCircle, ...(rec?.found ? styles.mapCircleFound : styles.mapCircleLocked) }}>
                    {rec?.found ? (
                      thumb ? <img src={thumb} style={styles.rowThumbImg} alt="" /> : <PlaceholderIcon style={styles.mapCircleIcon} />
                    ) : (
                      <PlaceholderIcon style={styles.mapCircleIconLocked} />
                    )}
                  </div>
                  {rec?.found && <div style={styles.mapTileName}>{s.name}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose}><X size={18} /></button>
        <div style={styles.modalTitle}>Achievements</div>
        <div style={styles.hint}>Tap a badge to see which species you've found in that group.</div>

        <div style={styles.legendRow}>
          {TIER_THRESHOLDS.map((tt) => (
            <div key={tt.tier} style={styles.legendItem}>
              <MedalBadge tier={tt.tier} size={26} />
              <div>
                <div style={styles.legendLabel}>{tt.label}</div>
                <div style={styles.legendDesc}>{tt.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 14 }}>
          {phylumStats.map((p) => (
            <button key={p.id} style={styles.achievementRow} onClick={() => setMapPhylum(p.id)}>
              <MedalBadge tier={p.tier} size={40} />
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={styles.achievementName}>{p.name}</div>
                <div style={styles.achievementSub}>{p.found} / {p.total} found</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Settings
--------------------------------------------------------- */
function SettingsModal({ styles, onClose, userEmail, onSignOut }) {
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose}><X size={18} /></button>
        <div style={styles.modalTitle}>Settings</div>
        <div style={{ ...styles.hint, marginTop: 12 }}>
          Theme options are coming back once more species are logged. For now, this is the only look.
        </div>
        <div style={{ ...styles.field, marginTop: 20 }}>
          <span style={styles.fieldLabel}>Signed in as</span>
          <div style={{ fontSize: 13, color: styles.text, marginBottom: 12 }}>{userEmail}</div>
          <button style={styles.secondaryBtn} onClick={onSignOut}>Sign Out</button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Detail modal
--------------------------------------------------------- */
function DetailModal({ styles, t, species, record, onClose, onUpdate, onToggleFound, onDeleteCustom, sharedPhotos, onSaveSharedPhoto, isAdmin }) {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [editingDefault, setEditingDefault] = useState(false);
  const [savingDefault, setSavingDefault] = useState(false);
  const PlaceholderIcon = PHYLUM_ICON[species.phylum] || FishIcon;
  const credit = sharedPhotos[slug(species.name)] || PHOTO_CREDITS[species.name];
  const headerPhoto = record.photos?.[0] || credit?.url;

  const [form, setForm] = useState({
    url: credit?.url || "", author: credit?.author || "",
    license: credit?.license || "", licenseUrl: credit?.licenseUrl || "",
    sourceUrl: credit?.sourceUrl || "",
  });

  async function handleSaveDefault() {
    setSavingDefault(true);
    try {
      await onSaveSharedPhoto(species.name, form);
      setEditingDefault(false);
    } catch (e) {
      // leave the form open so they can retry
    } finally {
      setSavingDefault(false);
    }
  }

  async function handlePhotoSelect(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setBusy(true); setErr(null);
    try {
      const compressed = await Promise.all(files.map((f) => compressImage(f)));
      onUpdate({ photos: [...(record.photos || []), ...compressed] });
    } catch (error) {
      setErr("Couldn't add that photo. Try a different file.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }
  function removePhoto(idx) {
    const next = [...(record.photos || [])];
    next.splice(idx, 1);
    onUpdate({ photos: next });
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose}><X size={18} /></button>
        <div style={styles.modalHeader}>
          <div style={styles.modalThumb}>
            {headerPhoto ? <img src={headerPhoto} style={styles.rowThumbImg} alt="" /> : <PlaceholderIcon style={styles.modalThumbIcon} />}
          </div>
          <div>
            <div style={styles.modalTitle}>{species.name}{species.groupName ? <span style={styles.customTag}>{species.groupName}</span> : null}</div>
            <div style={styles.modalLatin}>{species.latin}</div>
            <RarityTag rarity={species.rarity} styles={styles} />
          </div>
        </div>
        {!record.photos?.[0] && credit && !editingDefault && (
          <div style={styles.creditLine}>
            Reference photo: {credit.author ? `${credit.author}, ` : ""}
            <a href={credit.sourceUrl} target="_blank" rel="noopener noreferrer" style={styles.creditLink}>source</a>
            {" · "}
            <a href={credit.licenseUrl} target="_blank" rel="noopener noreferrer" style={styles.creditLink}>{credit.license}</a>
          </div>
        )}

        {isAdmin && (!editingDefault ? (
          <button style={styles.editDefaultLink} onClick={() => setEditingDefault(true)}>
            {credit ? "Edit default photo" : "Set a default photo (visible to everyone)"}
          </button>
        ) : (
          <div style={styles.defaultPhotoForm}>
            <label style={styles.field}>
              <span style={styles.fieldLabel}>Image URL</span>
              <input style={styles.dateInput} value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="Direct image link (ends in .jpg/.png)" />
            </label>
            <label style={styles.field}>
              <span style={styles.fieldLabel}>Author</span>
              <input style={styles.dateInput} value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} placeholder="Photographer name" />
            </label>
            <label style={styles.field}>
              <span style={styles.fieldLabel}>License</span>
              <input style={styles.dateInput} value={form.license} onChange={(e) => setForm({ ...form, license: e.target.value })} placeholder="e.g. CC BY-SA 4.0" />
            </label>
            <label style={styles.field}>
              <span style={styles.fieldLabel}>License URL</span>
              <input style={styles.dateInput} value={form.licenseUrl} onChange={(e) => setForm({ ...form, licenseUrl: e.target.value })} placeholder="Link to license text" />
            </label>
            <label style={styles.field}>
              <span style={styles.fieldLabel}>Source page URL</span>
              <input style={styles.dateInput} value={form.sourceUrl} onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })} placeholder="Commons file page link" />
            </label>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={styles.secondaryBtn} onClick={() => setEditingDefault(false)}>Cancel</button>
              <button style={styles.primaryBtn} disabled={!form.url.trim() || savingDefault} onClick={handleSaveDefault}>
                {savingDefault ? "Saving…" : "Save default photo"}
              </button>
            </div>
            <div style={styles.hint}>This photo and credit will show for every user until someone edits it again.</div>
          </div>
        ))}
        <button style={{ ...styles.foundToggle, ...(record.found ? styles.foundToggleActive : {}) }} onClick={onToggleFound}>
          <div style={{ ...styles.stampButton, ...(record.found ? styles.stampButtonActive : {}), width: 22, height: 22 }}>
            {record.found ? <Check size={14} strokeWidth={3} /> : null}
          </div>
          {record.found ? "Marked as found" : "Mark as found"}
        </button>
        {record.found && (
          <label style={styles.field}>
            <span style={styles.fieldLabel}><Calendar size={12} /> Date spotted</span>
            <input type="date" value={record.date || ""} onChange={(e) => onUpdate({ date: e.target.value })} style={styles.dateInput} />
          </label>
        )}
        <label style={styles.field}>
          <span style={styles.fieldLabel}><StickyNote size={12} /> Notes</span>
          <textarea value={record.notes || ""} onChange={(e) => onUpdate({ notes: e.target.value })} placeholder="Where, how deep, what it was doing…" style={styles.textarea} />
        </label>
        <div style={styles.field}>
          <span style={styles.fieldLabel}><Camera size={12} /> Photos</span>
          <div style={styles.photoGrid}>
            {(record.photos || []).map((src, i) => (
              <div key={i} style={styles.photoThumbWrap}>
                <img src={src} style={styles.photoThumb} alt="" />
                <button style={styles.photoRemove} onClick={() => removePhoto(i)}><X size={11} /></button>
              </div>
            ))}
            <button style={styles.photoAdd} onClick={() => fileRef.current?.click()} disabled={busy}>
              <Plus size={16} /><span style={{ fontSize: 10 }}>{busy ? "Adding…" : "Add"}</span>
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple capture="environment" style={{ display: "none" }} onChange={handlePhotoSelect} />
          {err && <div style={styles.saveError}>{err}</div>}
          <div style={styles.hint}>The first photo you add becomes this species' thumbnail. Video isn't supported yet.</div>
        </div>
        {onDeleteCustom && (
          <button style={styles.deleteRow} onClick={onDeleteCustom}><Trash2 size={13} /> Remove this species from your list</button>
        )}
      </div>
    </div>
  );
}

function AddSpeciesModal({ styles, defaultPhylum, onClose, onAdd }) {
  const [name, setName] = useState("");
  const [latin, setLatin] = useState("");
  const [phylum, setPhylum] = useState(defaultPhylum);
  const [rarity, setRarity] = useState("Common");
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose}><X size={18} /></button>
        <div style={styles.modalTitle}>Log a new species</div>
        <label style={styles.field}>
          <span style={styles.fieldLabel}>Name</span>
          <input style={styles.dateInput} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ocean Sunfish" />
        </label>
        <label style={styles.field}>
          <span style={styles.fieldLabel}>Scientific name (optional)</span>
          <input style={styles.dateInput} value={latin} onChange={(e) => setLatin(e.target.value)} placeholder="e.g. Mola mola" />
        </label>
        <label style={styles.field}>
          <span style={styles.fieldLabel}>Phylum group</span>
          <div style={{ position: "relative" }}>
            <select style={styles.select} value={phylum} onChange={(e) => setPhylum(e.target.value)}>
              {PHYLA.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <ChevronDown size={14} style={styles.selectChevron} />
          </div>
        </label>
        <label style={styles.field}>
          <span style={styles.fieldLabel}>Rarity (your best guess)</span>
          <div style={{ position: "relative" }}>
            <select style={styles.select} value={rarity} onChange={(e) => setRarity(e.target.value)}>
              {RARITY_LEVELS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <ChevronDown size={14} style={styles.selectChevron} />
          </div>
        </label>
        <button style={styles.primaryBtn} disabled={!name.trim()} onClick={() => onAdd({ name: name.trim(), latin: latin.trim() || "—", phylum, rarity })}>
          Add to my list
        </button>
      </div>
    </div>
  );
}

function Lightbox({ styles, url, credit, onClose }) {
  return (
    <div style={styles.lightboxOverlay} onClick={onClose}>
      <button style={styles.lightboxClose} onClick={onClose}><X size={22} /></button>
      <img src={url} style={styles.lightboxImg} alt="" onClick={(e) => e.stopPropagation()} />
      {credit && (
        <div style={styles.lightboxCredit} onClick={(e) => e.stopPropagation()}>
          {credit.author ? `${credit.author}, ` : ""}
          <a href={credit.sourceUrl} target="_blank" rel="noopener noreferrer" style={styles.creditLink}>source</a>
          {" · "}
          <a href={credit.licenseUrl} target="_blank" rel="noopener noreferrer" style={styles.creditLink}>{credit.license}</a>
        </div>
      )}
    </div>
  );
}

function ConfirmModal({ styles, message, onCancel, onConfirm }) {
  return (
    <div style={styles.overlay} onClick={onCancel}>
      <div style={{ ...styles.modal, maxWidth: 320 }} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalTitle}>Are you sure?</div>
        <div style={{ ...styles.hint, marginTop: 8 }}>{message}</div>
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button style={styles.secondaryBtn} onClick={onCancel}>Cancel</button>
          <button style={{ ...styles.primaryBtn, background: "#B5432A" }} onClick={onConfirm}>Reset everything</button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Style generator
--------------------------------------------------------- */
function getStyles(t) {
  return {
    app: { fontFamily: t.bodyFont, background: t.bg, color: t.text, minHeight: "100%", padding: "20px 20px 40px", position: "relative", maxWidth: 720, margin: "0 auto", boxSizing: "border-box" },
    panel: {},
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, gap: 10 },
    headerCenter: { textAlign: "center", flex: 1 },
    headerRight: { display: "flex", alignItems: "center", gap: 10 },
    iconBtn: { width: 40, height: 40, borderRadius: t.radiusPill, border: `${t.borderWidth}px solid ${t.border}`, background: t.panel, color: t.text, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: t.buttonShadow, flexShrink: 0 },
    eyebrow: { fontFamily: t.monoFont, fontSize: 10.5, letterSpacing: t.letterSpacing || "0.18em", color: t.accent, marginBottom: 2 },
    title: { fontFamily: t.headingFont, fontSize: 32, fontWeight: 600, margin: 0, color: t.text },
    stampGroup: { display: "flex", flexDirection: "column", alignItems: "center", gap: 3 },
    stamp: { border: `${t.borderWidth + 0.5}px solid ${t.border}`, borderRadius: "50%", width: 54, height: 54, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: "rotate(-6deg)", flexShrink: 0, background: t.panel },
    stampCount: { fontFamily: t.monoFont, fontSize: 15, lineHeight: 1, color: t.coral, fontWeight: 700 },
    stampTotal: { fontFamily: t.monoFont, fontSize: 8.5, color: t.textDim },
    stampCaption: { fontFamily: t.monoFont, fontSize: 7.5, letterSpacing: "0.06em", color: t.textDim, textAlign: "center", lineHeight: 1.2 },

    regionTabs: { display: "flex", gap: 8, overflowX: "auto", marginBottom: 12, paddingBottom: 2 },
    regionTab: { background: t.panel, border: `${t.borderWidth}px solid ${t.border}`, borderRadius: t.radius, padding: "8px 14px", cursor: "pointer", textAlign: "left", flexShrink: 0, boxShadow: t.shadow },
    regionTabActive: { borderColor: t.coral, background: "rgba(228,87,46,0.12)" },
    regionTabName: { fontSize: 13.5, fontWeight: 500, color: t.text },
    regionTabSub: { fontFamily: t.monoFont, fontSize: 9.5, color: t.textDim, marginTop: 1 },
    regionTabGhost: { display: "flex", alignItems: "center", gap: 5, background: "transparent", border: `${t.borderWidth}px dashed ${t.border}`, borderRadius: t.radius, padding: "8px 14px", color: t.textDim, fontSize: 12, flexShrink: 0, cursor: "not-allowed" },

    phylumTabs: { display: "flex", gap: 6, overflowX: "auto", marginBottom: 16, paddingBottom: 4 },
    phylumTab: { fontFamily: t.monoFont, fontSize: 11, letterSpacing: "0.02em", color: t.textDim, background: "transparent", border: "none", borderBottom: "2px solid transparent", padding: "4px 2px", cursor: "pointer", whiteSpace: "nowrap", marginRight: 12 },
    phylumTabActive: { color: t.coral, borderBottomColor: t.coral },

    toolbar: { display: "flex", gap: 10, marginBottom: 14 },
    searchBox: { flex: 1, display: "flex", alignItems: "center", gap: 8, background: t.panel, border: `${t.borderWidth}px solid ${t.border}`, borderRadius: t.radius, padding: "9px 12px" },
    searchInput: { flex: 1, background: "transparent", border: "none", outline: "none", color: t.text, fontSize: 14, fontFamily: t.bodyFont },
    toggleChip: { display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, fontFamily: t.bodyFont, color: t.accent, background: t.panel, border: `${t.borderWidth}px solid ${t.border}`, borderRadius: t.radiusPill, padding: "0 12px", cursor: "pointer", whiteSpace: "nowrap" },
    toggleChipActive: { background: t.accent, color: t.panel, borderColor: t.accent },

    list: {},
    row: { display: "flex", alignItems: "center", gap: 12, padding: "10px 2px", cursor: "pointer", borderBottom: `1px dotted rgba(143,191,174,0.18)` },
    stampButton: { width: 24, height: 24, borderRadius: "50%", border: `${t.borderWidth + 0.5}px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: t.panel, cursor: "pointer", background: t.panel },
    stampButtonActive: { background: t.coral, borderColor: t.coral, color: "#fff", transform: "rotate(-8deg)" },
    rowText: { minWidth: 0, flex: 1 },
    rowName: { fontSize: 14.5, fontWeight: 500, color: t.text, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" },
    customTag: { fontFamily: t.monoFont, fontSize: 8.5, color: t.textDim, border: `1px solid ${t.border}`, borderRadius: 4, padding: "1px 4px" },
    rarityTag: { fontFamily: t.monoFont, fontSize: 8.5, borderRadius: 4, padding: "1px 5px", fontWeight: 600 },
    rowLatin: { fontSize: 11, fontStyle: "italic", color: t.textDim },
    metaDate: { fontFamily: t.monoFont, fontSize: 10, color: t.textDim, marginTop: 2 },
    rowThumb: { width: 46, height: 46, borderRadius: 8, border: `${t.borderWidth}px solid ${t.border}`, background: t.panelAlt, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden", cursor: "zoom-in" },
    rowThumbImg: { width: "100%", height: "100%", objectFit: "cover" },
    rowThumbIcon: { width: 26, height: 26, color: t.textDim },

    empty: { color: t.textDim, fontSize: 13.5, padding: "30px 4px", lineHeight: 1.6 },
    addRow: { display: "flex", alignItems: "center", gap: 7, background: t.panel, border: `${t.borderWidth}px dashed ${t.border}`, borderRadius: t.radius, color: t.accent, fontSize: 13, fontFamily: t.bodyFont, padding: "11px 14px", cursor: "pointer", width: "100%", marginTop: 12 },
    footerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18 },
    resetLink: { display: "flex", alignItems: "center", gap: 5, background: "transparent", border: "none", color: t.textDim, fontSize: 11.5, cursor: "pointer", marginLeft: "auto" },
    saveError: { color: t.coral, fontSize: 11.5 },

    overlay: { position: "fixed", inset: 0, background: "rgba(10,20,20,0.7)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 50 },
    modal: { background: t.bg, border: `${t.borderWidth}px solid ${t.border}`, borderBottom: "none", borderRadius: `${t.radiusLg}px ${t.radiusLg}px 0 0`, padding: "22px 20px 28px", width: "100%", maxWidth: 480, maxHeight: "88vh", overflowY: "auto", position: "relative", boxSizing: "border-box" },
    closeBtn: { position: "absolute", top: 16, right: 16, background: "transparent", border: "none", color: t.textDim, cursor: "pointer" },
    backBtn: { display: "flex", alignItems: "center", gap: 5, background: "transparent", border: "none", color: t.accent, fontSize: 12.5, cursor: "pointer", marginBottom: 10, padding: 0 },
    modalHeader: { display: "flex", alignItems: "center", gap: 12, marginBottom: 16 },
    modalThumb: { width: 52, height: 52, borderRadius: 10, border: `${t.borderWidth}px solid ${t.border}`, background: t.panelAlt, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" },
    modalThumbIcon: { width: 30, height: 30, color: t.textDim },
    modalTitle: { fontFamily: t.headingFont, fontSize: 20, fontWeight: 600, color: t.text, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
    modalLatin: { fontSize: 12, fontStyle: "italic", color: t.textDim, marginTop: 2 },
    creditLine: { fontSize: 10.5, color: t.textDim, marginBottom: 14, lineHeight: 1.5 },
    lightboxOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24, boxSizing: "border-box", cursor: "zoom-out" },
    lightboxClose: { position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", width: 40, height: 40, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
    lightboxImg: { maxWidth: "100%", maxHeight: "80vh", borderRadius: 8, cursor: "default", boxShadow: "0 10px 40px rgba(0,0,0,0.5)" },
    lightboxCredit: { color: "#EAE3D2", fontSize: 12, marginTop: 14, textAlign: "center", cursor: "default" },
    editDefaultLink: { background: "transparent", border: "none", color: t.accent, fontSize: 11.5, cursor: "pointer", padding: 0, marginBottom: 16, textDecoration: "underline" },
    defaultPhotoForm: { background: t.panel, border: `${t.borderWidth}px solid ${t.border}`, borderRadius: t.radius, padding: 14, marginBottom: 16 },
    creditLink: { color: t.accent, textDecoration: "underline" },
    foundToggle: { display: "flex", alignItems: "center", gap: 9, background: t.panel, border: `${t.borderWidth}px solid ${t.border}`, borderRadius: t.radius, padding: "10px 14px", color: t.text, fontSize: 13.5, cursor: "pointer", width: "100%", marginBottom: 16, boxShadow: t.shadow },
    foundToggleActive: { borderColor: t.coral },
    field: { display: "block", marginBottom: 16 },
    fieldLabel: { display: "flex", alignItems: "center", gap: 5, fontFamily: t.monoFont, fontSize: 10.5, letterSpacing: "0.04em", color: t.accent, marginBottom: 6 },
    dateInput: { width: "100%", background: t.panel, border: `${t.borderWidth}px solid ${t.border}`, borderRadius: t.radius - 1, padding: "9px 11px", color: t.text, fontSize: 13.5, fontFamily: t.bodyFont, boxSizing: "border-box", outline: "none" },
    select: { width: "100%", background: t.panel, border: `${t.borderWidth}px solid ${t.border}`, borderRadius: t.radius - 1, padding: "9px 11px", color: t.text, fontSize: 13.5, fontFamily: t.bodyFont, boxSizing: "border-box", appearance: "none", outline: "none" },
    selectChevron: { position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)", color: t.textDim, pointerEvents: "none" },
    textarea: { width: "100%", minHeight: 64, background: t.panel, border: `${t.borderWidth}px solid ${t.border}`, borderRadius: t.radius - 1, padding: "9px 11px", color: t.text, fontSize: 13.5, fontFamily: t.bodyFont, boxSizing: "border-box", outline: "none", resize: "vertical" },
    photoGrid: { display: "flex", flexWrap: "wrap", gap: 8 },
    photoThumbWrap: { position: "relative", width: 68, height: 68 },
    photoThumb: { width: "100%", height: "100%", objectFit: "cover", borderRadius: 6, border: `${t.borderWidth}px solid ${t.border}` },
    photoRemove: { position: "absolute", top: -6, right: -6, width: 18, height: 18, borderRadius: "50%", background: t.coral, color: "#fff", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },
    photoAdd: { width: 68, height: 68, borderRadius: 6, border: `${t.borderWidth}px dashed ${t.border}`, background: "transparent", color: t.accent, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, cursor: "pointer" },
    hint: { fontSize: 11, color: t.textDim, lineHeight: 1.5, marginTop: 8 },
    deleteRow: { display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "none", color: "#C97A63", fontSize: 12.5, cursor: "pointer", marginTop: 6 },
    primaryBtn: { width: "100%", background: t.coral, color: "#fff", border: "none", borderRadius: t.radius, padding: "11px 14px", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: t.bodyFont },
    secondaryBtn: { flex: 1, background: t.panel, color: t.accent, border: `${t.borderWidth}px solid ${t.border}`, borderRadius: t.radius, padding: "11px 14px", fontSize: 14, cursor: "pointer", fontFamily: t.bodyFont },

    achievementRow: { display: "flex", alignItems: "center", gap: 14, width: "100%", background: t.panel, border: `${t.borderWidth}px solid ${t.border}`, borderRadius: t.radius, padding: "10px 14px", cursor: "pointer", marginBottom: 10, boxShadow: t.shadow },
    achievementName: { fontSize: 14, fontWeight: 500, color: t.text },
    achievementSub: { fontSize: 11.5, color: t.textDim, marginTop: 2, fontFamily: t.monoFont },

    legendRow: { display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14, padding: "10px 12px", background: t.panelAlt, border: `1px solid ${t.border}`, borderRadius: t.radius },
    legendItem: { display: "flex", alignItems: "center", gap: 6, minWidth: 110 },
    legendLabel: { fontSize: 11, fontWeight: 600, color: t.text },
    legendDesc: { fontSize: 9.5, color: t.textDim, fontFamily: t.monoFont },

    progressTrack: { width: "100%", height: 10, borderRadius: 999, background: t.panelAlt, border: `1px solid ${t.border}`, overflow: "hidden", marginTop: 6 },
    progressFill: { height: "100%", background: t.coral, borderRadius: 999, transition: "width 0.3s ease" },
    progressLabel: { fontFamily: t.monoFont, fontSize: 11, color: t.textDim, marginTop: 6, marginBottom: 16 },

    mapGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(64px, 1fr))", gap: 14 },
    mapTile: { display: "flex", flexDirection: "column", alignItems: "center", gap: 4 },
    mapCircle: { width: 56, height: 56, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", border: `2px solid ${t.border}` },
    mapCircleFound: { background: t.panelAlt },
    mapCircleLocked: { background: "#0a0a0a" },
    mapCircleIcon: { width: 28, height: 28, color: t.accent },
    mapCircleIconLocked: { width: 24, height: 24, color: "#2a2a2a" },
    mapTileName: { fontSize: 8.5, color: t.textDim, textAlign: "center", lineHeight: 1.2 },
  };
}