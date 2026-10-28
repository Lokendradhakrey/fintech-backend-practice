import User from "./User.model.js";

export const createUser = async (data) => {
  return User.create({
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    password: data.password,
  });
};

export const findById = async (id) => {
  return User.findById(id);
};

export const findByEmail = async (email) => {
  return User.findOne({ email });
};

export const findByPhone = async (phone) => {
  return User.findOne({ phone });
};

export const updateUser = async (id, data) => {
  return User.findByIdAndUpdate(id, {
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
  });
};

export const deleteUser = async (id, data) => {
  return User.findByIdAndUpdate(id, {
    isDeleted: true,
  });
};

export const deleteUserPermanantly = async (id) => {
  return User.deleteOne(id);
};
