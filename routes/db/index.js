const mongoose = require('mongoose');
const mongooseFuzzySearching = require('mongoose-fuzzy-searching');

const brewSchema = new mongoose.Schema({
  name: String,
  fullName: [String], // also contains aliases for formulas
  homepage: String,
  version: String,
  description: String,
  type: String,
});
brewSchema.plugin(mongooseFuzzySearching, { fields: ['name'] });
const BrewModel = mongoose.model('brew', brewSchema);

function doBrewsDiffer(elementDB, element) {
  let viable = false;

  if (elementDB.name !== element.name) {
    viable = true;
  }
  if (String(elementDB.full_name) !== String(element.full_name)) {
    viable = true;
  }
  if (elementDB.homepage !== element.homepage) {
    viable = true;
  }
  if (elementDB.version !== element.version) {
    viable = true;
  }
  if (elementDB.description !== element.description) {
    viable = true;
  }

  return viable;
}

async function update(arr) {
  const element = arr.shift();

  const brew = new BrewModel({
    name: element.name,
    fullName: element.fullName,
    homepage: element.homepage,
    version: element.version,
    description: element.description,
    type: element.type,
  });

  const brewDB = await BrewModel.findOne({
    name: brew.name,
    type: brew.type,
  });

  if (brewDB === null) {
    await brew.save();
    // console.log(`brew - ${brew.name} saved`)
  } else if (doBrewsDiffer(brewDB, brew)) {
    await BrewModel.deleteOne({ _id: brewDB.id });
    await brew.save();
  }

  if (arr) {
    update(arr);
  }
}

module.exports = {
  async findData(param) {
    const a = await BrewModel.fuzzySearch(param);
    // const a = await BrewModel.fuzzySearch({ query: param, minSize: 8 });

    return a;
  },
  async updateData(arr) {
    update(arr);
  },
};
