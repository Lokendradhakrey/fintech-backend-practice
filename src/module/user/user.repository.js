import User from "./User.model.js";

export const createUser = async (data) => {
  return await User.create({
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    password: data.password,
  });
};

export const findById = async (id) => {
  return await User.findById(id);
};

export const findByEmail = async (email, projection = "") => {
  return await User.findOne({ email }).select(projection);
};

export const findByPhone = async (phone, projection = "") => {
  return await User.findOne({ phone }).select(projection);
};

export const updateUser = async (id, data) => {
  return await User.findByIdAndUpdate(
    id,
    {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
    },
    { new: true, runValidators: true },
  );
};

export const deleteUser = async (id, data) => {
  return await User.findByIdAndUpdate(
    id,
    {
      isDeleted: true,
    },
    { new: true },
  );
};

export const deleteUserPermanantly = async (id) => {
  return await User.deleteOne(id);
};
