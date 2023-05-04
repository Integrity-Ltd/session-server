import mongoose from "mongoose";

let connection = async () => {
    try {
        const connectionParams = {
            useNewUrlParser: true,
            useUnifiedTopology: true,

        };
        await mongoose.connect(process.env.DB, connectionParams);
        console.log("connected to database.");
    } catch (error) {
        console.log("could not connect to database", error);
    }
};

export default { connection };