import mongoose, { Document, Schema } from "mongoose";

export interface IClient extends Document {
  name: string;
  id: string;
  secret: string;
  userId: Schema.Types.ObjectId;
  redirectUri: string;
}

const clientSchema = new Schema<IClient>({
  name: { type: String, required: true },
  id: { type: String, required: true },
  secret: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  redirectUri: { type: String, required: true },
});

export default mongoose.model<IClient>("Client", clientSchema);
