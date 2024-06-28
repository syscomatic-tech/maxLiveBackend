const { Skin } = require("./model");
const User = require("../User/model");
const { NotFound } = require("../../utility/errors");

const getAllSkin = async () => {
  const result = await Skin.find();
  return result;
};
const cloudinary = require("cloudinary").v2;

const createSkinService = async (payload, filePath) => {
  console.log(payload)
  payload.beans = JSON.parse(payload.beans)

  try {
    if(!filePath){
      throw new Error("Please add media to create skin")
    }


    let file = "";
    if (payload.fileType.startsWith("image/")) {
      if (!filePath) {
        throw new Error("Image file is required");
      }
      const cloudinaryResponse = await cloudinary.uploader.upload(filePath);
      file = cloudinaryResponse?.secure_url;
    } else if (payload.fileType.startsWith("video/")) {
      const cloudinaryResponse = await cloudinary.uploader.upload(filePath, {resource_type: "video"});
      file = cloudinaryResponse?.secure_url;
    }

    payload.file = file;

    const result = await Skin.create(payload);
    return result;
  } catch (error) {
    throw error;
  }
};

const sendSkinService = async (payload) => {
  const { userId, ...restData } = payload;
  const isUserExists = await User.findOne({ maxId: payload.userId });
  const isSkinExists = await Skin.findOne({ _id: payload.skin });
  if (!isUserExists) {
    throw new NotFound("User not found");
  }
  if (!isSkinExists) {
    throw new NotFound("User not found");
  }
  const isSkinsAlreadySent = isUserExists?.skins.filter(
    (item) => item.skin === payload.skin
  );

  if (isSkinsAlreadySent.length > 0) {
    throw new Error("You sent this skin before");
  }

  try {
    const result = await User.findOneAndUpdate(
      {maxId: payload.userId},
      {
        $push: {
          skins: restData,
        },
      },
      {
        new: true,
      }
    ).populate({
      path: "skins.skin",
      model: "Skin",
    });
    return result;
  } catch (error) {
    throw error; // Re-throw error for proper handling in controller
  }
};

const deleteSkinService = async (_id) => {
  try {
    const isSkinExist = await Skin.findById(_id);

    if (!isSkinExist) {
      throw new Error("Skin does not exist");
    }

    // Delete the skin document
    await Skin.deleteOne({ _id });

    // Remove the skin from all users' skins array
    await User.updateMany(
      { "skins.skin": _id },
      { $pull: { skins: { skin: _id } } }
    );

    return { success: true };
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  getAllSkin,
  createSkinService,
  sendSkinService,
  deleteSkinService,
};
