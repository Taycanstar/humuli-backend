import mongoose, { Document, Schema } from "mongoose";

interface ICode extends Document {
  value: string;
  clientId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  redirectUri: string;
}

const codeSchema = new Schema<ICode>({
  value: { type: String, required: true },
  clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  redirectUri: { type: String, required: true },
});

export default mongoose.model<ICode>("Code", codeSchema);
