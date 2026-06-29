import mongoose from 'mongoose';

const ItemSchema = new mongoose.Schema({
  containerId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Container', required: true },
  name:         { type: String, required: true },
  quantity:     { type: Number, required: true, default: 1 },
  tags:         [String],
  needsRestock: { type: Boolean, default: false },
});

ItemSchema.index({ name: 'text', tags: 'text' });
ItemSchema.index({ needsRestock: 1 });

export default mongoose.model('Item', ItemSchema);
