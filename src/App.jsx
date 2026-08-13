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
  { id: "tunicates", name: "Tunicates" },
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

const TUNICATES = [
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
    ["Rough Barnacle", "Balanus crenatus", "Common"],
    ["Ivory Barnacle", "Balanus eburneus", "Uncommon"],
  ]},
  { name: "Shrimp", variants: [
    ["Skeleton Shrimp", "Caprella linearis", "Common"],
    ["Mysid Shrimp", "Neomysis americana", "Common"],
    ["Sand Shrimp", "Crangon septemspinosa", "Common"],
    ["Sculptured Shrimp", "Sclerocrangon boreas", "Rare"],
    ["Aesop Shrimp", "Pandalus montagui", "Uncommon"],
    ["Spiny Lebbeid Shrimp", "Lebbeus groenlandicus", "Rare"],
  ]},
  { name: "Hermit Crab", variants: [
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
  ["Snail Fur", "Hydractinia echinata", "Common"],
  ["Leptomedusa", "Leptomedusae", "Uncommon"],
  ["Portuguese Man-of-War", "Physalia physalis", "Rare"],
  ["Lion's Mane Jellyfish", "Cyanea capillata", "Common"],
  ["Moon Jellyfish", "Aurelia aurita", "Common"],
  ["Dead Man's Fingers", "Alcyonium digitatum", "Common"],
  ["Sea Strawberry Soft Coral", "Gersemia rubiformis", "Uncommon"],
  ["Northern Star Coral", "Astrangia poculata", "Uncommon"],
  ["Northern Cerianthid", "Cerianthus borealis", "Uncommon"],
];

const CNIDARIAN_GROUPS = [
  {
    name: "Hydromedusa",
    variants: [
      ["Many-Armed Hydromedusa", "Aequorea forskalea", "Rare"],
    ],
  },
  {
    name: "Anemone",
    variants: [
      ["Lined Anemone", "Fagesia lineata", "Uncommon"],
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
  ["Purple Sponge", "Haliclona permollis", "Uncommon"],
  ["Boring Sponge", "Cliona celata", "Common"],
  ["Red Beard Sponge", "Microciona prolifera", "Common"],
  ["Palmate Sponge", "Isodictya palmata", "Uncommon"],
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
  ]},
  { name: "Nudibranch", variants: [
    ["Rim-backed Nudibranch", "Doto coronata", "Rare"],
    ["Atlantic Ancula", "Ancula gibbosa", "Rare"],
    ["Frond Aeolis Nudibranch", "Dendronotus frondosus", "Uncommon"],
    ["Robust Frond Aeolis", "Dendronotus robustus", "Rare"],
    ["Red-finger Aeolis", "Flabellina verrucosa", "Uncommon"],
    ["Aeolis Nudibranch", "—", "Uncommon"],
    ["Salmon Aeolis", "Flabellina salmonacea", "Rare"],
    ["Shag-rug Aeolis", "Aeolidia papillosa", "Rare"],
    ["Green Balloon Aeolis", "Eubranchus rupium", "Rare"],
    ["Painted Balloon Aeolis", "Eubranchus sp.", "Very Rare"],
    ["Orange-tip Cuthona", "Cuthona amoena", "Rare"],
    ["Nudibranch (Cuthona pustulata)", "Cuthona pustulata", "Rare"],
    ["Winged Thecacera", "Thecacera pennigera", "Very Rare"],
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
  ...buildSingle(TUNICATES, "tunicates"),
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

/* ---------------------------------------------------------
   Species info — size, where found, and a fun fact.
   Being filled in a batch at a time; species without an
   entry here just won't show a description section yet.
--------------------------------------------------------- */
const SPECIES_INFO = {
  "Atlantic Cod": { size: "Up to 6 ft, though most caught today are 2–3 ft", range: "Cold coastal waters from Greenland to Cape Hatteras, usually near the bottom", fact: "Cod can live over 20 years and were once so abundant off New England that early European fishermen said you could walk across the water on their backs." },
  "Atlantic Mackerel": { size: "10–14 inches", range: "Open coastal waters, Labrador to North Carolina, often in large schools near the surface", fact: "Mackerel swim constantly their whole lives — they have no swim bladder, so stopping means sinking." },
  "Atlantic Herring": { size: "10–12 inches", range: "Coastal and offshore waters throughout the North Atlantic", fact: "Herring schools can number in the millions and are a keystone food source for whales, seabirds, and larger fish." },
  "Striped Bass": { size: "Typically 20–40 inches, can exceed 4 ft", range: "Coastal waters and estuaries from the St. Lawrence to Florida", fact: "Stripers migrate hundreds of miles between summer feeding grounds and winter waters, and the same fish often return to the same river to spawn every year." },
  "Winter Flounder": { size: "12–18 inches", range: "Shallow coastal bays and harbors, Labrador to Georgia", fact: "Like all flatfish, it starts life swimming upright with an eye on each side, then one eye migrates across the head as it settles onto the seafloor." },
  "Haddock": { size: "Around 20 inches average", range: "Deeper, colder waters of the North Atlantic continental shelf", fact: "Haddock have a distinctive black \"thumbprint\" mark behind the gills, sometimes called the \"Devil's mark\" or \"St. Peter's mark\" in folklore." },
  "Pollock": { size: "Up to 3 ft", range: "Rocky coastal waters, Labrador to New Jersey", fact: "Unlike cod and haddock, pollock often swim well up in the water column rather than hugging the bottom." },
  "Atlantic Sturgeon": { size: "Can reach 14 ft and live over 60 years", range: "Coastal rivers and nearshore waters, Canada to Florida", fact: "Sturgeon are living fossils — their body plan has barely changed in over 100 million years, and they're covered in bony plates called scutes instead of scales." },
  "Bluefin Tuna": { size: "Can exceed 10 ft and 1,000 lbs", range: "Open ocean, ranges the entire North Atlantic", fact: "Bluefin can heat their blood above the surrounding water temperature, letting them hunt in cold water most fish can't tolerate." },
  "Spiny Dogfish": { size: "2–4 ft", range: "Coastal and shelf waters throughout the North Atlantic", fact: "Named for the mild venomous spine in front of each dorsal fin — and they can live over 30 years." },
  "Little Skate": { size: "About 20 inches across", range: "Sandy and muddy coastal bottoms, Nova Scotia to North Carolina", fact: "Skates lay their eggs in tough rectangular cases called \"mermaid's purses,\" which often wash up on beaches." },
  "Harbor Seal": { size: "5–6 ft, up to 300 lbs", range: "Coastal waters and haul-out rocks, Canada to the Carolinas", fact: "Harbor seals can dive over 500 feet and hold their breath for up to 30 minutes." },
  "Gray Seal": { size: "Males up to 8 ft and 800 lbs", range: "Coastal waters and remote islands, Canada to Cape Cod", fact: "Gray seal pups are born with a fluffy white coat and can nurse for only about 3 weeks before being left to fend for themselves." },
  "Harbor Porpoise": { size: "4–5 ft", range: "Cool coastal waters throughout the North Atlantic", fact: "One of the smallest cetaceans in the world, and unlike dolphins, they rarely leap or ride boat wakes." },
  "Humpback Whale": { size: "45–50 ft", range: "Migrates through the North Atlantic between feeding and breeding grounds", fact: "Each humpback's tail flukes are as unique as a fingerprint, letting researchers identify individuals for decades." },
  "North Atlantic Right Whale": { size: "45–55 ft", range: "Coastal waters off New England and the Canadian Maritimes", fact: "One of the most endangered large whales on Earth, with roughly 350 individuals left; they're named for being the \"right\" whale to hunt since they float when killed." },
  "Loggerhead Sea Turtle": { size: "3 ft shell length, up to 300 lbs", range: "Warmer Atlantic waters, ranging as far north as Cape Cod in summer", fact: "Loggerheads have powerful jaws built to crush hard-shelled prey like whelks and crabs." },
  "Blue Shark": { size: "6–10 ft", range: "Open ocean, common well offshore throughout the Atlantic", fact: "One of the most far-ranging sharks known — tagged individuals have crossed entire ocean basins." },
  "Basking Shark": { size: "Second-largest fish alive, up to 26 ft", range: "Cold coastal and offshore Atlantic waters, often near the surface", fact: "Despite its size, it's a harmless filter feeder that strains plankton through its enormous open mouth." },
  "Atlantic Torpedo": { size: "Up to 6 ft", range: "Deeper coastal waters along the Atlantic seaboard", fact: "It can generate an electric shock of over 200 volts to stun prey or deter predators." },
  "Winter Skate": { size: "Up to 3.5 ft", range: "Sandy coastal bottoms, Newfoundland to North Carolina", fact: "Named for being most common inshore during colder months, moving to deeper water in summer." },
  "Clearnose Skate": { size: "About 2.5 ft", range: "Coastal sandy bottoms, mid-Atlantic and southern New England", fact: "Gets its name from translucent patches on either side of its snout." },
  "American Eel": { size: "2–4 ft", range: "Rivers, estuaries, and coastal waters up and down the Atlantic seaboard", fact: "Every American eel is born in the Sargasso Sea and migrates enormous distances to freshwater rivers to grow up, then returns to the Sargasso once to spawn and die." },
  "Atlantic Menhaden": { size: "10–12 inches", range: "Coastal waters, Nova Scotia to Florida", fact: "Menhaden filter plankton from the water and travel in massive schools that support entire coastal food webs." },
  "Red Hake": { size: "Up to 2 ft", range: "Muddy coastal and shelf bottoms of the Northwest Atlantic", fact: "Juveniles famously shelter inside the shells of live sea scallops for protection." },
  "Spotted Hake": { size: "Up to 16 inches", range: "Coastal waters, Nova Scotia to Florida", fact: "Uses long, whisker-like fin rays under its chin to feel for prey on the seafloor." },
  "Tomcod": { size: "6–12 inches", range: "Coastal bays and river mouths, Labrador to Virginia", fact: "One of the few fish that spawns in near-freezing water, right under winter ice." },
  "Oyster Toadfish": { size: "Up to 15 inches", range: "Shallow bays and estuaries, Maine to Florida", fact: "Males guard their eggs fiercely and can grunt loudly using a specialized swim-bladder muscle." },
  "Goosefish": { size: "Up to 4 ft", range: "Sandy and muddy bottoms from Newfoundland to Florida", fact: "Also called \"monkfish,\" it lures prey using a modified fin ray that dangles like a fishing rod above its huge mouth." },
  "Northern Pipefish": { size: "Up to 12 inches", range: "Shallow eelgrass beds along the Atlantic coast", fact: "A close relative of seahorses — and like seahorses, it's the male that carries the developing eggs." },
  "Lined Seahorse": { size: "About 6 inches", range: "Seagrass beds, Nova Scotia to the Gulf of Mexico", fact: "Seahorses mate for life and perform an elaborate daily greeting dance with their partner." },
  "Acadian Redfish": { size: "Up to 16 inches", range: "Deep, cold offshore waters of the Gulf of Maine", fact: "Gives birth to live young rather than laying eggs, unusual among bony fish." },
  "Striped Searobin": { size: "Up to 15 inches", range: "Sandy coastal bottoms, Maine to Florida", fact: "\"Walks\" along the seafloor using modified lower fin rays that work almost like tiny legs." },
  "Northern Searobin": { size: "Up to 17 inches", range: "Coastal sandy bottoms, Nova Scotia to Florida", fact: "Makes a distinct grunting or croaking sound by vibrating muscles against its swim bladder." },
  "Longhorn Sculpin": { size: "Up to 18 inches", range: "Rocky and sandy coastal bottoms, Labrador to Virginia", fact: "Named for its long, spiny head projections that look like horns." },
  "Grubby": { size: "Up to 7 inches", range: "Shallow coastal waters, Labrador to New Jersey", fact: "A small, chunky sculpin often found hiding among rocks and eelgrass at low tide." },
  "Shorthorn Sculpin": { size: "Up to 15 inches", range: "Cold coastal waters, Arctic to Cape Cod", fact: "Extremely tolerant of near-freezing water, common under sea ice in the far north." },
  "Sea Raven": { size: "Up to 2 ft", range: "Rocky coastal bottoms, Labrador to Virginia", fact: "Can inflate its stomach with water or air like a balloon when threatened, and comes in a wide range of colors from red to purple to white." },
  "Alligatorfish": { size: "Around 6 inches", range: "Cold offshore waters of the Gulf of Maine and northward", fact: "Its body is armored in bony plates arranged in ridges, giving it a miniature alligator-like look." },
  "Lumpfish": { size: "Up to 2 ft", range: "Cold rocky coastal waters, Arctic to New Jersey", fact: "Has a suction-cup-like disc on its belly, formed from modified pelvic fins, that lets it stick firmly to rocks." },
  "Atlantic Spiny Lumpsucker": { size: "1–2 inches", range: "Cold northern Atlantic waters", fact: "One of the tiniest fish on this list, covered in rows of bony spines and often found clinging to seaweed." },
  "Black Sea Bass": { size: "Up to 24 inches", range: "Coastal reefs and wrecks, Cape Cod to Florida", fact: "Nearly all black sea bass start life as females and can later change into males." },
  "Cobia": { size: "Can exceed 5 ft", range: "Warmer Atlantic waters, occasionally straying north in summer", fact: "Often follows sharks, rays, and even boats out of curiosity, earning it the nickname \"crab-eater.\"" },
  "Mackerel Scad": { size: "Up to 14 inches", range: "Warmer offshore Atlantic waters", fact: "Forms tight, fast-moving schools and is an important forage fish for larger predators." },
  "Sheepshead": { size: "Up to 2.5 ft", range: "Coastal structure and jetties, mostly mid-Atlantic and south", fact: "Named for its human-like front teeth, perfectly built for crushing barnacles and shellfish." },
  "Scup": { size: "Up to 18 inches", range: "Coastal waters, Cape Cod to South Carolina", fact: "Also called \"porgy,\" it's one of the most commonly caught panfish along the mid-Atlantic coast." },
  "Tautog": { size: "Up to 3 ft", range: "Rocky reefs and wrecks, Nova Scotia to South Carolina", fact: "Sleeps tucked into rock crevices at night and can be strikingly slow-moving and tame around structure." },
  "Cunner": { size: "Up to 15 inches", range: "Rocky coastal waters and pilings, Labrador to New Jersey", fact: "One of the few fish known to go dormant and stop feeding entirely during the coldest winter months." },
  "Ocean Pout": { size: "Up to 3.5 ft", range: "Cold coastal bottoms, Labrador to Delaware", fact: "Produces a natural antifreeze protein in its blood that keeps it active in near-freezing water." },
  "Snakeblenny": { size: "Up to 16 inches", range: "Cold rocky coastal waters of the North Atlantic", fact: "Its long, eel-like body and small fins let it slip easily into rocky crevices." },
  "Arctic Shanny": { size: "Up to 8 inches", range: "Cold rocky tide pools and shallows, Arctic to the Gulf of Maine", fact: "Often found stranded in tide pools at low tide, tolerating hours out of full submersion." },
  "Radiated Shanny": { size: "Up to 6 inches", range: "Rocky coastal shallows, Labrador to New Jersey", fact: "Named for the radiating lines patterning its fins." },
  "Rock Gunnel": { size: "Up to 12 inches", range: "Rocky intertidal zones, Labrador to New Jersey", fact: "Can survive being exposed to air at low tide for hours by hiding under damp seaweed and rocks." },
  "Atlantic Wolffish": { size: "Up to 5 ft", range: "Cold rocky and offshore waters of the North Atlantic", fact: "Has powerful jaws and blunt teeth built for crushing sea urchins and hard-shelled prey whole." },
  "American Sand Lance": { size: "Up to 7 inches", range: "Sandy coastal waters throughout the North Atlantic", fact: "Buries itself in sand to hide, and forms massive schools that whales, seabirds, and larger fish depend on." },
  "Windowpane Flounder": { size: "Up to 18 inches", range: "Sandy coastal bottoms, Gulf of Maine to South Carolina", fact: "Its body is thin enough to be almost translucent, giving it the name \"windowpane.\"" },
  "Summer Flounder": { size: "Up to 3 ft", range: "Coastal waters, Maine to Florida", fact: "Also called \"fluke,\" it's an aggressive ambush predator despite spending most of its time buried in sand." },
  "Fourspot Flounder": { size: "Up to 18 inches", range: "Sandy coastal and shelf bottoms, Gulf of Maine to Florida", fact: "Named for the four dark spots that form a distinctive square pattern on its upper side." },
  "American Plaice": { size: "Up to 2.5 ft", range: "Cold offshore waters of the North Atlantic", fact: "Also called \"dab,\" it's one of the larger flatfish found on the Northwest Atlantic continental shelf." },
  "Gray Triggerfish": { size: "Up to 2 ft", range: "Warmer Atlantic waters, occasionally straying north in summer", fact: "Can lock its dorsal spine upright to wedge itself into rock crevices, making it nearly impossible to pull out." },
  "Northern Puffer": { size: "Up to 14 inches", range: "Coastal waters, Maine to Florida", fact: "Inflates itself with water when threatened and contains a potent toxin, tetrodotoxin, in its skin and organs." },
  "Ocean Sunfish": { size: "Can exceed 10 ft and 2,000 lbs", range: "Open Atlantic waters, occasionally seen basking at the surface", fact: "The heaviest bony fish in the world, and its body plan is essentially just a massive head with fins." },

  "American Lobster": { size: "Typically 8–24 inches", range: "Rocky coastal bottoms, Labrador to New Jersey", fact: "Lobsters can regrow lost claws and legs, and some individuals are believed to live well past 50 years." },
  "Atlantic Rock Crab": { size: "Up to 5 inches across", range: "Rocky and sandy coastal bottoms, Labrador to South Carolina", fact: "One of the most commonly found crabs under rocks at low tide throughout New England." },
  "Jonah Crab": { size: "Up to 6 inches across", range: "Rocky coastal and offshore bottoms, Newfoundland to Florida", fact: "Named after a 19th-century American folk figure, and often confused with the similar rock crab." },
  "Blue Crab": { size: "Up to 9 inches across", range: "Estuaries and coastal waters, mostly mid-Atlantic and south", fact: "An excellent swimmer thanks to its paddle-shaped rear legs, unusual among crabs." },
  "Green Crab": { size: "Up to 4 inches across", range: "Coastal waters and tide pools throughout the North Atlantic", fact: "An invasive species from Europe that has spread widely along the Atlantic coast and can shift its shell color from green to red as it ages." },
  "Horseshoe Crab": { size: "Up to 2 ft including tail", range: "Coastal shallows and beaches, Maine to Mexico", fact: "More closely related to spiders and scorpions than to true crabs, and its blue blood is used in medical testing worldwide." },
  "Northern Krill": { size: "About 1.5 inches", range: "Open and coastal North Atlantic waters", fact: "Forms massive swarms that are a critical food source for whales, seabirds, and countless fish species." },
  "Acorn Barnacle": { size: "Under 1 inch", range: "Rocky intertidal zones throughout the North Atlantic", fact: "Feeds by kicking feathery legs out of its shell to filter plankton from the water, even while permanently cemented in place." },
  "Snow Crab": { size: "Up to 6 inches across", range: "Cold offshore waters of the North Atlantic", fact: "Prefers deep, near-freezing water and is one of the most commercially important crab species in Atlantic Canada." },
  "Portly Spider Crab": { size: "Up to 4 inches across", range: "Coastal bottoms, Maine to Florida", fact: "Often decorates its shell with algae and sponges as camouflage." },
  "Atlantic Sand Crab": { size: "About 1.5 inches", range: "Sandy surf zones along the Atlantic coast", fact: "Also called the \"mole crab,\" it burrows backward into wet sand with each retreating wave." },
  "Ocellate Lady Crab": { size: "Up to 3 inches across", range: "Sandy coastal bottoms, Cape Cod to Florida", fact: "Named for the eye-like spots scattered across its purple-speckled shell." },
  "Atlantic Fiddler Crab": { size: "About 1 inch across", range: "Coastal marshes and mudflats, mid-Atlantic and south", fact: "Males have one dramatically oversized claw used to attract mates and defend burrows." },
  "Norway King Crab": { size: "Up to 6 inches across", range: "Cold deep waters of the North Atlantic", fact: "A true king crab with only three pairs of visible walking legs, unlike most crabs' four." },

  "Forbes Sea Star": { size: "Up to 5 inches across", range: "Coastal rocky and sandy bottoms, Gulf of Maine to Florida", fact: "One of the most common sea stars on the Atlantic coast, and can regenerate a lost arm over several months." },
  "Northern Sea Star": { size: "Up to 16 inches across", range: "Cold coastal waters, Labrador to New Jersey", fact: "A voracious predator of mussels and clams, prying shells open with steady pressure from its tube feet." },
  "Green Sea Urchin": { size: "Up to 3 inches across", range: "Rocky coastal bottoms throughout the North Atlantic", fact: "Grazes on kelp using a specialized five-part jaw structure known as \"Aristotle's lantern.\"" },
  "Sand Dollar": { size: "Up to 3 inches across", range: "Sandy coastal bottoms, Gulf of Maine to South Carolina", fact: "The living animal is covered in short purple-brown spines; the smooth white \"skeleton\" people find on beaches is only what's left after it dies." },
  "Orange-Footed Sea Cucumber": { size: "Up to 10 inches", range: "Cold coastal and offshore waters of the North Atlantic", fact: "Feeds by catching drifting particles on sticky, branching tentacles around its mouth." },
  "Basket Star": { size: "Central disc up to 4 inches, arms spanning over a foot", range: "Cold deep coastal and offshore waters", fact: "Its arms branch repeatedly into a lacy net used to catch plankton, which it unfurls at night." },
  "Blood Star": { size: "Up to 5 inches across", range: "Rocky coastal and offshore bottoms, Arctic to New Jersey", fact: "Named for its vivid red-orange color, though shade can vary widely between individuals." },
  "Daisy Brittle Star": { size: "Disc about 1 inch, arms up to 3 inches", range: "Rocky and sandy coastal bottoms, Arctic to New Jersey", fact: "Moves with quick, snake-like arm movements and can shed an arm to escape a predator's grip." },

  "Blue Mussel": { size: "Up to 4 inches", range: "Rocky intertidal zones throughout the North Atlantic", fact: "Anchors itself to rocks using tough protein threads called byssal threads, which it can also use to \"crawl\" slowly." },
  "Eastern Oyster": { size: "Up to 8 inches", range: "Estuaries and coastal bays, Gulf of St. Lawrence to the Gulf of Mexico", fact: "A single oyster can filter over 50 gallons of water a day, helping keep coastal waters clear." },
  "Moon Snail": { size: "Shell up to 5 inches", range: "Sandy coastal bottoms, Labrador to Florida", fact: "Drills a perfectly round hole into other mollusks' shells using an acid-secreting organ to feed on them." },
  "Common Periwinkle": { size: "Up to 1 inch", range: "Rocky intertidal zones throughout the North Atlantic", fact: "Introduced from Europe centuries ago, it's now one of the most abundant snails on the Atlantic coast." },
  "Sea Scallop": { size: "Shell up to 8 inches", range: "Cold offshore sandy bottoms of the North Atlantic", fact: "Unlike most bivalves, scallops can swim by rapidly clapping their shells together to jet away from predators." },
  "Northern Quahog": { size: "Shell up to 4 inches", range: "Sandy and muddy coastal bottoms, Gulf of St. Lawrence to Florida", fact: "Its shell was used by Indigenous peoples of the Northeast to make wampum beads." },
  "Longfin Inshore Squid": { size: "Up to 20 inches including tentacles", range: "Coastal and shelf waters, Newfoundland to Florida", fact: "Can rapidly change color and pattern using pigment cells called chromatophores in its skin." },
  "Waved Whelk": { size: "Shell up to 4 inches", range: "Cold coastal bottoms, Arctic to New Jersey", fact: "Lays egg cases in a spongy cluster that often washes ashore and is sometimes mistaken for a sea sponge." },
  "Knobbed Whelk": { size: "Shell up to 9 inches, the largest snail on the Atlantic coast", range: "Sandy coastal bottoms, Cape Cod to Florida", fact: "Its egg case looks like a string of tan, disc-shaped beads and can wash up over a foot long." },
  "Channeled Whelk": { size: "Shell up to 7.5 inches", range: "Sandy coastal bottoms, Cape Cod to Florida", fact: "Named for the deep spiral grooves, or \"channels,\" running down its shell." },

  "Moon Jellyfish": { size: "Bell up to 16 inches across", range: "Coastal waters throughout the North Atlantic", fact: "Its sting is mild enough to barely be felt by most people, and its translucent bell often shows four visible horseshoe-shaped organs." },
  "Lion's Mane Jellyfish": { size: "Bell can exceed 3 ft, tentacles over 100 ft", range: "Cold coastal waters, Arctic to the mid-Atlantic", fact: "The largest known species of jellyfish in the world, with tentacles that can stretch longer than a blue whale." },
  "Portuguese Man-of-War": { size: "Float up to 12 inches, tentacles up to 30 ft", range: "Warm open ocean, occasionally drifting into northern waters", fact: "Not actually a single animal — it's a colony of specialized organisms working together, and its sting can be dangerous even after it's washed ashore dead." },
  "Northern Star Coral": { size: "Colonies a few inches across", range: "Rocky coastal bottoms, Cape Cod to the Gulf of Mexico", fact: "One of the only true stony corals found this far north, tolerating much colder water than its tropical relatives." },
  "Dead Man's Fingers": { size: "Colonies up to 8 inches tall", range: "Rocky coastal bottoms, Arctic to New Jersey", fact: "A soft coral whose pale, lobed colonies genuinely resemble bloated fingers reaching up from the seafloor." },
  "Northern Red Anemone": { size: "Up to 4 inches across", range: "Rocky coastal bottoms, Arctic to New Jersey", fact: "Can live for decades in the same spot and comes in shades ranging from deep red to orange to pale pink." },

  "Lugworm": { size: "Up to 9 inches", range: "Sandy and muddy intertidal flats throughout the North Atlantic", fact: "Its distinctive coiled sand castings on beaches are actually its digested waste, pushed up from a U-shaped burrow below." },
  "Bloodworm": { size: "Up to 14 inches", range: "Sandy and muddy intertidal flats, Gulf of St. Lawrence to Florida", fact: "Named for its red blood pigment visible through its skin, and it can deliver a surprisingly sharp bite with four tiny jaws." },
  "Clam Worm": { size: "Up to 3 ft", range: "Sandy and muddy coastal bottoms throughout the North Atlantic", fact: "A fast, active predator that hunts small invertebrates at night and is a favorite bait among surf fishermen." },
  "Golden Star Tunicate": { size: "Colonies a few inches across, individuals just millimeters", range: "Rocky coastal bottoms and pilings throughout the North Atlantic", fact: "Each tiny star-shaped cluster is actually a group of individual animals sharing a common outer casing." },
  "Appendicularian": { size: "Body just a few millimeters", range: "Open coastal and offshore waters worldwide", fact: "Builds and discards an elaborate mucus \"house\" around itself every few hours to filter plankton, one of the strangest structures in the animal kingdom." },
  "Sea Vase": { size: "Up to 6 inches tall", range: "Coastal bottoms and pilings throughout the North Atlantic", fact: "An invasive tunicate from Europe that can form dense colonies and filters an enormous volume of water for its size." },

  "Acadian Hermit Crab": { size: "Body up to 1.5 inches", range: "Rocky and sandy coastal bottoms, Labrador to New Jersey", fact: "Constantly trades up to bigger empty snail shells as it grows, sometimes lining up to swap shells with other hermit crabs in size order." },
  "Longwrist Hermit Crab": { size: "Body around 1 inch", range: "Rocky coastal shallows and tide pools, Gulf of Maine to New Jersey", fact: "Named for its unusually long, slender front claws, which it uses to pick delicately at food." },
  "Aesop Shrimp": { size: "Up to 2 inches", range: "Rocky coastal bottoms, often among anemones", range2: null, fact: "Often lives in a loose partnership with anemones, picking food scraps from their tentacles without getting stung." },
  "Mysid Shrimp": { size: "Under 1 inch", range: "Coastal waters throughout the North Atlantic, often in dense swarms", fact: "Carries its eggs and young in a pouch under its body, similar to a tiny shrimp-shaped kangaroo." },
  "Sand Shrimp": { size: "Up to 2 inches", range: "Sandy and muddy coastal shallows throughout the North Atlantic", fact: "Can change color to match its sandy surroundings, making it nearly invisible when still." },
  "Skeleton Shrimp": { size: "Up to 1 inch", range: "Rocky coastal bottoms, clinging to seaweed and hydroids", fact: "Its thin, stick-like body lets it blend in almost perfectly with the algae and hydroids it clings to." },
  "Sculptured Shrimp": { size: "Up to 3 inches", range: "Cold offshore waters of the North Atlantic", fact: "Named for the ridged, sculpted texture of its shell." },
  "Spiny Lebbeid Shrimp": { size: "Around 1.5 inches", range: "Cold northern Atlantic coastal waters", fact: "Covered in small spines along its shell, an unusual defense for a shrimp this size." },
  "Baltic Isopod": { size: "Up to 1 inch", range: "Coastal shallows and eelgrass beds throughout the North Atlantic", fact: "Can tolerate a wide range of salinity, making it common in both full-strength seawater and brackish estuaries." },
  "Hedgehog Amphipod": { size: "Under 0.5 inch", range: "Rocky coastal bottoms, often among seaweed", fact: "Uses its curved, spiny body to wedge tightly into crevices, much like its hedgehog namesake." },
  "Lentil Sea Spider": { size: "Body under 0.25 inch", range: "Rocky and hydroid-covered coastal bottoms", fact: "Not a true spider at all — sea spiders are their own ancient group of marine arthropods, and this one feeds by piercing hydroids with a needle-like mouthpart." },
  "Anemone Sea Spider": { size: "Body around 0.5 inch", range: "Rocky coastal bottoms wherever anemones are found", fact: "Feeds almost exclusively on anemones, somehow avoiding their stinging cells entirely." },
  "Arctic Lyre Crab": { size: "Shell up to 2 inches across", range: "Cold coastal waters, Arctic to the Gulf of Maine", fact: "Named for its narrow, lyre-shaped shell outline." },
  "Ivory Barnacle": { size: "Under 1 inch", range: "Coastal waters and pilings, Cape Cod to the Gulf of Mexico", fact: "Often grows on shells, docks, and other hard surfaces in slightly warmer water than its northern relatives." },
  "Rough Barnacle": { size: "Under 1 inch", range: "Rocky coastal shallows throughout the North Atlantic", fact: "Its shell plates have a distinctly ridged, rough texture compared to smoother barnacle species." },

  "Purple-Spined Sea Urchin": { size: "Up to 2 inches across", range: "Rocky and sandy bottoms, Cape Cod to the Gulf of Mexico", fact: "One of the most common sea urchins south of New England, often found in large aggregations on rocky bottoms." },
  "Smooth Sunstar": { size: "Up to 16 inches across", range: "Cold coastal and offshore waters of the North Atlantic", fact: "One of the largest sea stars in the region, with 9–10 arms and a smooth, almost velvety surface." },
  "Spiny Sunstar": { size: "Up to 14 inches across", range: "Cold coastal and offshore waters of the North Atlantic", fact: "A fast-moving predator for a sea star, known to actively hunt and eat other sea stars." },
  "Green Slender Sea Star": { size: "Up to 2 inches across", range: "Rocky and gravel coastal bottoms, Gulf of Maine and north", fact: "Broods its young directly under its body rather than releasing eggs into open water." },
  "Horse Star": { size: "Up to 14 inches across", range: "Cold offshore waters of the North Atlantic", fact: "A deep-water sea star with a thick, leathery body and short spines covering its upper surface." },
  "Badge Star": { size: "Up to 4 inches across", range: "Cold offshore waters of the North Atlantic", fact: "Named for its flattened, shield-like shape, unusual among sea stars." },
  "Winged Sea Star": { size: "Up to 6 inches across", range: "Cold offshore waters of the North Atlantic", fact: "Covered in a soft, cushiony skin webbed between its arms, giving it a winged appearance." },
  "Polar Sea Star": { size: "Up to 8 inches across", range: "Cold Arctic and sub-Arctic coastal waters", fact: "Broods its eggs by holding them under its body through the winter rather than releasing them to drift." },
  "Scarlet Psolus": { size: "Up to 4 inches", range: "Rocky coastal bottoms, Arctic to the Gulf of Maine", fact: "A brilliantly colored sea cucumber that attaches firmly to rocks with a flattened sole, unlike most free-crawling sea cucumbers." },
  "Brown Psolus": { size: "Up to 5 inches", range: "Rocky coastal and offshore bottoms of the North Atlantic", fact: "Covered in overlapping bony plates that give it a scaled, almost armored look." },
  "Hairy Sea Cucumber": { size: "Up to 4 inches", range: "Sandy and muddy coastal bottoms, Gulf of Maine and south", fact: "Its skin is covered in fine, hair-like projections that give it a fuzzy texture." },

  "Plate Limpet": { size: "Shell up to 2 inches", range: "Rocky intertidal zones, Arctic to New Jersey", fact: "Grazes algae off rocks at a set \"home scar\" it returns to after each feeding trip, worn perfectly to match its own shell." },
  "Rough Periwinkle": { size: "Shell under 0.5 inch", range: "Rocky intertidal zones, high on the shore, throughout the North Atlantic", fact: "Lives higher on the shoreline than almost any other marine snail, tolerating long stretches out of water between tides." },
  "Yellow Periwinkle": { size: "Shell under 0.5 inch", range: "Rocky intertidal zones, often on rockweed, throughout the North Atlantic", fact: "Usually found clinging directly to rockweed rather than bare rock, and its shell color can range from bright yellow to orange or brown." },
  "Shark Eye": { size: "Shell up to 3.5 inches", range: "Sandy coastal bottoms, Cape Cod to Florida", fact: "A moon snail relative named for the glossy, eye-like spiral pattern on its shell." },
  "Atlantic Oyster Drill": { size: "Shell under 1.5 inches", range: "Coastal bottoms and oyster beds, Gulf of St. Lawrence to Florida", fact: "Drills a tiny hole through oyster and mussel shells to feed, making it a serious pest of commercial shellfish beds." },
  "Atlantic Dogwinkle": { size: "Shell up to 1.5 inches", range: "Rocky intertidal zones throughout the North Atlantic", fact: "Its shell shape and thickness change dramatically depending on how exposed to waves its home shoreline is." },
  "Stimpson's Colus": { size: "Shell up to 4 inches", range: "Cold offshore waters of the North Atlantic", fact: "A deep-water whelk relative with a notably tall, slender spiral shell." },
  "Boreal Topsnail": { size: "Shell under 0.5 inch", range: "Cold rocky coastal bottoms, Arctic to the Gulf of Maine", fact: "Its small, cone-shaped shell has a pearly, iridescent interior." },
  "Naked Sea Butterfly": { size: "Under 1 inch", range: "Open cold Atlantic waters", fact: "A swimming sea slug with no shell at all — it \"flies\" through open water by flapping wing-like extensions of its foot." },
  "Common Slippersnail": { size: "Shell up to 2 inches", range: "Coastal bottoms throughout the North Atlantic", fact: "Often stacks in chains on top of other slippersnails, with the largest, oldest individual on the bottom functioning as a female and younger ones above as males." },
  "Eastern White Slippersnail": { size: "Shell up to 1 inch", range: "Coastal bottoms, Cape Cod to the Gulf of Mexico", fact: "Often found attached to the underside of another slippersnail's shell, forming similar stacks to its common relative." },
  "Threeline Mudsnail": { size: "Shell under 0.5 inch", range: "Muddy and sandy coastal flats, Cape Cod to Florida", fact: "Named for the three fine spiral lines that run across its shell." },
  "Eastern Mudsnail": { size: "Shell under 1 inch", range: "Muddy and sandy intertidal flats throughout the North Atlantic", fact: "Often gathers in huge numbers on tidal mudflats, following chemical trails to find food." },
  "Brown-band Wentletrap": { size: "Shell under 1 inch", range: "Coastal bottoms, Cape Cod to the Gulf of Mexico", fact: "Feeds almost exclusively on sea anemones, somehow avoiding being stung." },
  "Great Piddock": { size: "Shell up to 5 inches", range: "Soft rock and clay coastal bottoms, Gulf of St. Lawrence to New Jersey", fact: "Bores into soft rock or clay using the sharp, file-like ridges on its own shell, and can spend its entire life sealed inside the burrow it dug." },
  "Rounded Pandora": { size: "Shell under 1.5 inches", range: "Sandy coastal bottoms, Gulf of St. Lawrence to Florida", fact: "Its two shell halves are noticeably unequal in shape, one flat and one curved." },
  "Blood Ark": { size: "Shell up to 2.5 inches", range: "Sandy and muddy coastal bottoms, Cape Cod to Florida", fact: "One of the only bivalves with true red blood, thanks to hemoglobin — most mollusks' blood is colorless or blue." },
  "Northern Cyclocardia": { size: "Shell under 1 inch", range: "Cold coastal and offshore bottoms of the North Atlantic", fact: "Its shell has strong, evenly spaced ribs radiating out from the hinge." },
  "Wavy Astarte": { size: "Shell under 1.5 inches", range: "Cold coastal and offshore bottoms of the North Atlantic", fact: "Named for the wavy growth ridges that ripple across its thick, sturdy shell." },
  "Greenland Smoothcockle": { size: "Shell up to 3 inches", range: "Cold coastal and offshore waters of the North Atlantic", fact: "Unlike most cockles, its shell is smooth rather than deeply ribbed." },
  "Arctic Wedgeclam": { size: "Shell under 1 inch", range: "Sandy intertidal and shallow coastal zones, Arctic to New Jersey", fact: "Lives just beneath the sand surface in the swash zone, often surfacing briefly with each wave." },
  "Atlantic Surfclam": { size: "Shell up to 9 inches, one of the largest clams on the coast", range: "Sandy offshore bottoms, Gulf of St. Lawrence to Florida", fact: "The primary clam used in most commercial fried clam strips and chowder in the U.S." },
  "Atlantic Razorclam": { size: "Shell up to 10 inches", range: "Sandy intertidal and shallow coastal zones throughout the North Atlantic", fact: "Can dig itself several feet into wet sand in seconds using its strong, muscular foot." },
  "Softshell Clam": { size: "Shell up to 4 inches", range: "Sandy and muddy intertidal flats throughout the North Atlantic", fact: "Its thin, brittle shell can't fully close, so it relies on burrowing deep in mud for protection instead." },
  "Truncate Softshell Clam": { size: "Shell up to 2 inches", range: "Cold sandy and muddy coastal bottoms of the North Atlantic", fact: "Named for its squared-off, \"truncated\" rear edge, unlike the rounder shape of its softshell relative." },
  "Common Jingle": { size: "Shell up to 2 inches", range: "Coastal bottoms and pilings throughout the North Atlantic", fact: "Cements itself to rocks and shells with a calcified plug, and its thin, glossy shell was traditionally used to make wind chimes — hence the name." },
  "Ocean Quahog": { size: "Shell up to 4.5 inches", range: "Cold offshore sandy bottoms of the North Atlantic", fact: "One of the longest-lived animals on Earth — individuals have been aged at over 500 years old using growth rings in their shells." },
  "Iceland Scallop": { size: "Shell up to 4 inches", range: "Cold coastal and offshore waters, Arctic to the Gulf of Maine", fact: "Prefers colder water than the sea scallop and is commercially harvested in the far North Atlantic." },
  "Bay Scallop": { size: "Shell up to 3 inches", range: "Shallow eelgrass beds, Cape Cod to the Gulf of Mexico", fact: "Has a ring of small blue eyes along the edge of its mantle that can detect movement and light." },
  "Black Mussel": { size: "Shell up to 3 inches", range: "Coastal waters, particularly northern parts of the Atlantic seaboard", fact: "Closely resembles the blue mussel and often grows alongside it in mixed beds." },
  "Ribbed Mussel": { size: "Shell up to 4 inches", range: "Salt marshes and muddy estuaries, Gulf of St. Lawrence to Florida", fact: "Lives partly buried in marsh mud among the roots of cordgrass, helping stabilize the marsh itself." },
  "Northern Horse Mussel": { size: "Shell up to 8 inches, among the largest mussels in the region", range: "Cold coastal and offshore bottoms of the North Atlantic", fact: "Forms dense reef-like beds that create habitat for many other species." },
  "Dressed Chiton": { size: "Up to 1.5 inches", range: "Rocky coastal shallows, Gulf of Maine to New Jersey", fact: "Its eight overlapping shell plates let it curl into a ball if dislodged from a rock, like a marine pillbug." },
  "Mottled Chiton": { size: "Up to 1 inch", range: "Rocky intertidal zones throughout the North Atlantic", fact: "Grips rock so tightly with its muscular foot that it's very difficult to pry off without injuring it." },
  "Eastern Beaded Chiton": { size: "Up to 1 inch", range: "Rocky coastal shallows, Cape Cod to the Gulf of Mexico", fact: "Named for the small beaded ridges running across each of its eight shell plates." },
  "Yellow-edge Cadlina": { size: "Up to 1.5 inches", range: "Rocky coastal bottoms of the North Atlantic", fact: "A sea slug that gets its bright coloration from the sponges it eats, storing their chemical defenses in its own skin." },
  "White Atlantic Cadlina": { size: "Up to 1 inch", range: "Rocky coastal bottoms of the North Atlantic", fact: "Feeds exclusively on certain sponges, and its pale coloring closely matches the sponges it lives on." },
  "Barnacle-eating Onchidoris": { size: "Up to 1 inch", range: "Rocky coastal bottoms wherever barnacles grow", fact: "One of the few nudibranchs that preys specifically on barnacles rather than sponges or hydroids." },
  "Fuzzy Onchidoris": { size: "Up to 1 inch", range: "Rocky coastal bottoms throughout the North Atlantic", fact: "Its back is covered in soft, fuzzy-looking projections called tubercles, giving it its name." },
  "Hairy Spiny Doris": { size: "Up to 2 inches", range: "Rocky coastal bottoms throughout the North Atlantic", fact: "Covered in fine, hair-like spines that help it blend in among the sponges it feeds on." },
  "Rim-backed Nudibranch": { size: "Up to 1 inch", range: "Rocky coastal bottoms of the North Atlantic", fact: "Has a distinct raised rim running along the edge of its back, giving it its name." },
  "Atlantic Ancula": { size: "Under 1 inch", range: "Rocky coastal bottoms of the North Atlantic", fact: "A small, delicate nudibranch usually found grazing on colonial hydroids and bryozoans." },
  "Frond Aeolis Nudibranch": { size: "Up to 4 inches, one of the larger nudibranchs in the region", range: "Rocky coastal bottoms of the North Atlantic", fact: "Its back is covered in branching, frond-like projections that store stinging cells stolen from the anemones and hydroids it eats." },
  "Robust Frond Aeolis": { size: "Up to 4 inches", range: "Cold coastal waters of the North Atlantic", fact: "A close relative of the frond aeolis, but noticeably stockier and heavier-bodied." },
  "Green Balloon Aeolis": { size: "Under 1 inch", range: "Rocky coastal bottoms of the North Atlantic", fact: "Its back is covered in inflated, balloon-like projections that can be shed if grabbed by a predator." },
  "Painted Balloon Aeolis": { size: "Under 0.5 inch", range: "Rocky coastal bottoms of the North Atlantic", fact: "One of the smallest and least commonly recorded nudibranchs on this list, identified by its brightly patterned balloon-shaped back projections." },
  "Orange-tip Cuthona": { size: "Under 0.5 inch", range: "Rocky coastal bottoms of the North Atlantic", fact: "Named for the bright orange tips on the slender projections covering its back." },
  "Red-finger Aeolis": { size: "Up to 1.5 inches", range: "Rocky coastal bottoms of the North Atlantic", fact: "Its back is lined with reddish, finger-like projections that store stinging cells from the hydroids it preys on." },
  "Salmon Aeolis": { size: "Up to 1 inch", range: "Rocky coastal bottoms of the North Atlantic", fact: "Named for its distinctive salmon-pink coloring." },
  "Shag-rug Aeolis": { size: "Up to 2.5 inches", range: "Rocky coastal bottoms throughout the North Atlantic", fact: "Densely covered in shaggy projections that give it a rug-like texture, and it's one of the more commonly encountered nudibranchs on this coast." },
  "Winged Thecacera": { size: "Under 1 inch", range: "Rocky coastal bottoms of the North Atlantic", fact: "Has two distinctive wing-like extensions near its rhinophores, unlike most other nudibranchs." },
  "Nudibranch (Cuthona pustulata)": { size: "Under 0.5 inch", range: "Rocky coastal bottoms of the North Atlantic", fact: "A tiny, rarely recorded sea slug identified largely by the pustule-like bumps along its back projections." },

  "Boring Sponge": { size: "Encrusting colonies, variable size", range: "Rocky and shelled coastal bottoms throughout the North Atlantic", fact: "Bores into shells and coral using acid, riddling old oyster and clam shells with a network of small tunnels." },
  "Breadcrumb Sponge": { size: "Encrusting colonies, up to a foot across", range: "Rocky coastal bottoms throughout the North Atlantic", fact: "Named for its crumbly, bread-like texture, and it comes in colors ranging from bright orange to yellow-green." },
  "Red Beard Sponge": { size: "Colonies up to 8 inches", range: "Rocky coastal bottoms and pilings throughout the North Atlantic", fact: "Its branching, finger-like growth and bright red-orange color make it one of the most recognizable sponges on the coast." },
  "Finger Sponge": { size: "Colonies up to 1 ft tall", range: "Rocky and sandy coastal bottoms, Gulf of St. Lawrence to New Jersey", fact: "Grows in tall, branching fingers that provide shelter for small fish and crustaceans." },
  "Purple Sponge": { size: "Encrusting colonies, several inches across", range: "Rocky coastal bottoms throughout the North Atlantic", fact: "Its deep purple color comes from pigments that may help protect it from sunlight in shallow water." },
  "Palmate Sponge": { size: "Colonies up to 8 inches", range: "Rocky coastal bottoms of the North Atlantic", fact: "Grows in flattened, hand-like lobes, giving it its \"palmate\" name." },

  "Northern Cerianthid": { size: "Tube up to 2 ft, with tentacles spanning several inches", range: "Sandy and muddy coastal bottoms of the North Atlantic", fact: "Builds a long, felt-like tube in the sediment that it can retract into instantly if disturbed, unlike true anemones which have no tube." },
  "Lined Anemone": { size: "Up to 2 inches", range: "Rocky coastal bottoms of the North Atlantic", fact: "Named for the fine lines patterning its column, visible when the animal is extended." },
  "Rugose Anemone": { size: "Up to 3 inches", range: "Rocky coastal bottoms of the North Atlantic", fact: "Its column has a rough, wrinkled (\"rugose\") texture compared to smoother anemone species." },
  "Burrowing Anemone": { size: "Up to 4 inches", range: "Sandy and muddy coastal bottoms of the North Atlantic", fact: "Lives buried in soft sediment with only its tentacle crown showing, retracting completely out of sight when disturbed." },
  "Clonal Plumose Anemone": { size: "Up to 4 inches", range: "Rocky coastal bottoms and pilings throughout the North Atlantic", fact: "Can reproduce by splitting itself in two, forming dense clusters of genetically identical anemones." },
  "White Anemone": { size: "Up to 1 inch", range: "Rocky coastal bottoms and pilings throughout the North Atlantic", fact: "One of the smaller anemones on this coast, often found in large numbers on docks and pilings." },
  "Swimming Anemone": { size: "Up to 3 inches across", range: "Cold coastal and offshore waters of the North Atlantic", fact: "One of the few anemones that can actively swim, flexing its whole body to escape predators like sea stars." },
  "Sea Strawberry Soft Coral": { size: "Colonies up to 8 inches tall", range: "Rocky coastal bottoms, Arctic to the Gulf of Maine", fact: "Its lobed, reddish colonies genuinely resemble a cluster of strawberries growing on a rocky branch." },
  "Hydroid (Candelabrum phrygium)": { size: "Colonies up to 6 inches tall", range: "Cold rocky coastal bottoms of the North Atlantic", fact: "Grows in a branching, candelabra-like shape, unusual among hydroids which are typically feathery or bushy." },
  "Tubularian Hydroid": { size: "Colonies up to 6 inches tall", range: "Rocky coastal bottoms and pilings throughout the North Atlantic", fact: "Its long, tube-like stalks topped with pink flower-like polyps make it one of the more eye-catching hydroids in shallow water." },
  "Snail Fur": { size: "Colonies a few inches across", range: "Coastal bottoms throughout the North Atlantic", fact: "Grows in a fuzzy colony directly on hermit crab shells, giving the crab's borrowed home a furry look." },
  "Leptomedusa": { size: "Bell typically under 1 inch", range: "Coastal and offshore waters throughout the North Atlantic", fact: "A broad group of small, delicate jellyfish that are the free-swimming stage of many hydroid species." },
  "Many-Armed Hydromedusa": { size: "Bell up to 6 inches", range: "Coastal and offshore North Atlantic waters", fact: "Has dozens of fine tentacles trailing from its bell, far more than most jellyfish relatives." },
  "Sea Gooseberry": { size: "Under 1 inch", range: "Coastal waters throughout the North Atlantic", fact: "A comb jelly, not a true jellyfish — it propels itself with rows of tiny beating cilia that shimmer with rainbow colors as they catch the light." },
  "Northern Comb Jelly": { size: "Up to 6 inches", range: "Cold coastal waters of the North Atlantic", fact: "Uses two long, sticky tentacles to snare small prey rather than stinging cells like true jellyfish." },
  "Sea Walnut": { size: "Up to 4 inches", range: "Coastal waters throughout the North Atlantic", fact: "An invasive comb jelly in parts of its range that can reproduce explosively and disrupt local plankton populations." },
  "Beroe's Comb Jelly": { size: "Up to 4 inches", range: "Coastal waters throughout the North Atlantic", fact: "Unlike most comb jellies, it has no tentacles at all — instead it swallows other comb jellies whole with its large mouth." },

  "Leafy Paddle Worm": { size: "Up to 6 inches", range: "Rocky and sandy coastal bottoms throughout the North Atlantic", fact: "Named for the flat, leaf-shaped paddles running along each side of its body, used for swimming and gas exchange." },
  "Twelve-Scaled Worm": { size: "Up to 1.5 inches", range: "Rocky coastal bottoms throughout the North Atlantic", fact: "Covered in overlapping protective scales along its back, similar to a tiny armored caterpillar." },
  "Fifteen-Scaled Worm": { size: "Up to 2 inches", range: "Rocky coastal bottoms throughout the North Atlantic", fact: "Often found living inside the tubes or burrows of other marine worms, sharing their shelter." },
  "Eyed-Fringed Worm": { size: "Up to 4 inches", range: "Rocky and sandy coastal bottoms of the North Atlantic", fact: "Has small light-sensing eyespots near its head, unusual detail for a worm this size." },
  "Johnston's Ornate Worm": { size: "Up to 2 inches", range: "Rocky coastal bottoms of the North Atlantic", fact: "Named for the ornate, banded pattern along its body." },
  "Red Terebellid Worm": { size: "Up to 6 inches", range: "Sandy and muddy coastal bottoms throughout the North Atlantic", fact: "Builds a tube in the sediment and extends long, sticky feeding tentacles across the surface to gather food particles." },
  "Terebellid Worm": { size: "Up to 8 inches", range: "Sandy and muddy coastal bottoms throughout the North Atlantic", fact: "A broad group of tube-dwelling worms that use branching gills near their head to breathe while staying safely hidden." },
  "Bamboo Worm": { size: "Up to 6 inches", range: "Sandy and muddy coastal bottoms throughout the North Atlantic", fact: "Its body is segmented into distinct sections that resemble bamboo stalks, and it lives head-down in a delicate sand-grain tube." },
  "Sabellid Worm": { size: "Up to 4 inches", range: "Coastal bottoms and rocky crevices throughout the North Atlantic", fact: "Also called a feather duster worm, it extends a fan of feathery gills to filter food, instantly retracting into its tube at the slightest disturbance." },
  "Slime Worm": { size: "Up to 8 inches", range: "Muddy coastal bottoms of the North Atlantic", fact: "Surrounds itself in a thick coat of mucus inside its burrow, which gives it its name." },
  "Sinistral Spiral Tube Worm": { size: "Tube under 0.5 inch", range: "Rocky coastal bottoms and shells throughout the North Atlantic", fact: "Builds a tiny, tightly coiled calcium tube that spirals in a left-handed (\"sinistral\") direction, unusual among tube worms." },
  "Lacy Tube Worm": { size: "Colonies up to a few inches across", range: "Rocky coastal bottoms and pilings throughout the North Atlantic", fact: "Forms delicate, lace-like colonies of intertwined calcium tubes on hard surfaces." },
  "Spoon Worm": { size: "Up to 8 inches", range: "Muddy and sandy coastal bottoms of the North Atlantic", fact: "Has an extendable, spoon-shaped feeding proboscis that can stretch many times the length of its body." },
  "Chevron Amphiporus": { size: "Up to 6 inches", range: "Rocky and sandy coastal bottoms of the North Atlantic", fact: "A ribbon worm that captures prey using an explosively eversible proboscis lined with a sharp stylet." },
  "Northern Lamp Shell": { size: "Shell under 1 inch", range: "Cold rocky coastal bottoms of the North Atlantic", fact: "A brachiopod, not a mollusk — despite looking like a small clam, it's only distantly related and represents a group that's been mostly unchanged for hundreds of millions of years." },
  "Spiral-tufted Bryozoan": { size: "Colonies up to 4 inches tall", range: "Rocky coastal bottoms throughout the North Atlantic", fact: "Grows in spiraling, tufted colonies made of thousands of tiny individual animals working together." },
  "Sea Lace": { size: "Encrusting colonies, several inches across", range: "Rocky coastal bottoms and seaweed throughout the North Atlantic", fact: "Forms a delicate, lace-like encrusting colony directly on seaweed blades and rocks." },
  "Red Crust": { size: "Encrusting colonies, variable size", range: "Rocky coastal bottoms throughout the North Atlantic", fact: "A thin, reddish encrusting bryozoan often mistaken for algae at first glance." },
  "Ellis' Bryozoan": { size: "Colonies up to 8 inches tall", range: "Rocky coastal bottoms throughout the North Atlantic", fact: "Also called \"hornwrack,\" its stiff, seaweed-like fronds are actually a colony of thousands of tiny animals, and dried pieces have historically been used as a natural moth repellent." },

  "Tunicate (Molgula citrina)": { size: "Up to 1 inch", range: "Rocky coastal bottoms and pilings throughout the North Atlantic", fact: "Also called a \"sea grape\" relative, it has a tough outer tunic that can be covered in bits of sand and debris for camouflage." },
  "Tunicate (Didemnum vexillum)": { size: "Colonies can spread over several square feet", range: "Rocky coastal bottoms and pilings, spreading through much of the North Atlantic", fact: "A fast-spreading invasive species that can smother shellfish beds and dock structures by overgrowing them entirely." },
  "Tunicate (Diplosoma listerianum)": { size: "Colonies a few inches across", range: "Rocky coastal bottoms and pilings throughout the North Atlantic", fact: "Forms thin, translucent sheet-like colonies you can sometimes see the individual animals through." },
  "Sea Grape": { size: "Up to 1.5 inches", range: "Rocky coastal bottoms and pilings throughout the North Atlantic", fact: "Its clustered, grape-like clumps of translucent individuals give it its common name." },
  "Blood Drop Tunicate": { size: "Colonies a few inches across, individuals just millimeters", range: "Rocky coastal bottoms and pilings throughout the North Atlantic", fact: "Forms small red or orange star-shaped clusters that can look like drops of blood scattered across a rock." },
  "Club Tunicate": { size: "Up to 6 inches tall", range: "Rocky coastal bottoms and pilings throughout the North Atlantic", fact: "An invasive species from Asia with a tall, club-shaped body that can form dense clusters on docks and hulls." },
  "Orange Sheath Tunicate": { size: "Colonies a few inches across", range: "Rocky coastal bottoms and pilings throughout the North Atlantic", fact: "Forms bright orange encrusting colonies and, like several tunicates on this list, is considered invasive in parts of its range." },
  "Pink Sea Pork": { size: "Colonies several inches across", range: "Rocky coastal bottoms throughout the North Atlantic", fact: "Its thick, fleshy, pinkish colonies genuinely resemble a slab of raw meat lying on the rocks." },
  "Stalked Tunicate": { size: "Up to 4 inches including stalk", range: "Cold coastal and offshore bottoms of the North Atlantic", fact: "Attaches to the seafloor by a long stalk, holding its feeding body up off the bottom." },
  "Sea Peach": { size: "Up to 3 inches", range: "Rocky coastal and offshore bottoms of the North Atlantic", fact: "Its round, fuzzy, peachy-orange body genuinely resembles the fruit it's named after." },
  "Wrinkled Whelk": { size: "Shell up to 3 inches", range: "Cold coastal bottoms of the North Atlantic", fact: "Its shell surface has a distinctly wrinkled, uneven texture compared to the smoother waved whelk." },
  "Aeolis Nudibranch": { size: "Varies widely by species, generally under 2 inches", range: "Rocky coastal bottoms throughout the North Atlantic", fact: "\"Aeolid\" nudibranchs as a group are famous for stealing stinging cells from the hydroids and anemones they eat, then repurposing them in their own back projections for defense." },
};


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
function TunicateIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M15 10c-5 4-7 10-6 18 1 8 6 12 15 12s14-4 15-12c1-8-1-14-6-18" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M17 10c1-3 3-4 7-4s6 1 7 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="18" cy="15" r="1.4" fill="currentColor" />
      <circle cx="30" cy="15" r="1.4" fill="currentColor" />
    </svg>
  );
}
const PHYLUM_ICON = {
  "fish-vertebrates": FishIcon, "tunicates": TunicateIcon, "mollusks": ShellIcon, "crustaceans": CrabIcon,
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
                  {isCustom && null}
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
  const info = SPECIES_INFO[species.name];
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

        {info && (
          <div style={styles.infoBox}>
            <div style={styles.infoRow}><span style={styles.infoLabel}>Size</span><span style={styles.infoValue}>{info.size}</span></div>
            <div style={styles.infoRow}><span style={styles.infoLabel}>Found</span><span style={styles.infoValue}>{info.range}</span></div>
            <div style={styles.infoFact}>{info.fact}</div>
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
    infoBox: { background: t.panel, border: `${t.borderWidth}px solid ${t.border}`, borderRadius: t.radius, padding: "12px 14px", marginBottom: 16 },
    infoRow: { display: "flex", gap: 8, fontSize: 12.5, marginBottom: 5 },
    infoLabel: { color: t.accent, fontFamily: t.monoFont, fontSize: 10, minWidth: 46, flexShrink: 0, textTransform: "uppercase", letterSpacing: "0.03em", paddingTop: 1 },
    infoValue: { color: t.text },
    infoFact: { fontSize: 12.5, color: t.textDim, lineHeight: 1.5, marginTop: 8, fontStyle: "italic" },
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