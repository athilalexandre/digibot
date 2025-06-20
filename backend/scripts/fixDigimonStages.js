const mongoose = require('mongoose');
const DigimonData = require('../models/digimonData');

// Mapeamento oficial dos estágios (exemplo expandido, adicione todos que quiser)
const stageMap = {
  "Botamon": "Baby I",
  "Punimon": "Baby I",
  "Poyomon": "Baby I",
  "Yuramon": "Baby I",
  "Koromon": "Baby II",
  "Tsunomon": "Baby II",
  "Tokomon": "Baby II",
  "Tanemon": "Baby II",
  "Agumon": "Child",
  "Gabumon": "Child",
  "Patamon": "Child",
  "Biyomon": "Child",
  "Tentomon": "Child",
  "Palmon": "Child",
  "Gomamon": "Child",
  "Greymon": "Adult",
  "Garurumon": "Adult",
  "Birdramon": "Adult",
  "Kabuterimon": "Adult",
  "Togemon": "Adult",
  "Ikkakumon": "Adult",
  "Angemon": "Adult",
  "MetalGreymon": "Perfect",
  "WereGarurumon": "Perfect",
  "Garudamon": "Perfect",
  "MegaKabuterimon": "Perfect",
  "Lillymon": "Perfect",
  "Zudomon": "Perfect",
  "MagnaAngemon": "Perfect",
  "WarGreymon": "Mega",
  "MetalGarurumon": "Mega",
  "Phoenixmon": "Mega",
  "HerculesKabuterimon": "Mega",
  "Rosemon": "Mega",
  "Vikemon": "Mega",
  "Seraphimon": "Mega",
  "Omnimon": "Ultimate",
  // ...adicione todos os outros digimons aqui...
};

async function fixStages() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/digibot');
  const digimons = await DigimonData.find({});
  let count = 0;
  for (const digi of digimons) {
    const correctStage = stageMap[digi.name];
    if (correctStage && digi.stage !== correctStage) {
      digi.stage = correctStage;
      await digi.save();
      count++;
    }
  }
  console.log(`Corrigidos ${count} Digimons!`);
  process.exit(0);
}

fixStages(); 