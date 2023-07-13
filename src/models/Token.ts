import mongoose, { Document, Schema } from "mongoose";

interface IToken extends Document {
  value: string;
  clientId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
}

const tokenSchema = new Schema<IToken>({
  value: { type: String, required: true },
  clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

export default mongoose.model<IToken>("Token", tokenSchema);
