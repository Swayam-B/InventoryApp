import mongoose from 'mongoose';

const ContainerSchema = new mongoose.Schema({
  locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  name:        { type: String, required: true },
  description: { type: String },
  imageKey:    { type: String },
});

export default mongoose.model('Container', ContainerSchema);
