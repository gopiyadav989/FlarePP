import mongoose from "mongoose";

export default function () {
    mongoose
        .connect(process.env.MONGODB_URL)
        .then(() => console.log("connected. to database"))
        .catch((e) => console.log(e));
}