const mongoose = require('mongoose');
const Fuse = require('fuse.js');

const brewSchema = new mongoose.Schema({
  name: String,
  fullName: [String], // also contains aliases for formulas
  homepage: String,
  version: String,
  description: String,
  type: String,
});
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
    const list = await BrewModel.find({});

    const options = {
      includeScore: true,
      keys: [
        {
          name: 'name',
          weight: 0.7,
        },
        {
          name: 'fullName',
          weight: 0.3,
        },
      ],
    };

    function filterScore(item) {
      return item.score <= 0.1;
    }

    const fuse = new Fuse(list, options);
    const fuseList = fuse.search(param).filter(filterScore);

    const reducedFuseList = [];
    for (let i = 0; i < fuseList.length; i += 1) {
      reducedFuseList.push(fuseList[i].item);
    }

    return reducedFuseList;
  },
  async updateData(arr) {
    update(arr);
  },
};
