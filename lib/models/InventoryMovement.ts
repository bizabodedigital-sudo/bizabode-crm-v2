import mongoose from 'mongoose';

const InventoryMovementSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
    index: true,
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true,
    index: true,
  },
  itemSku: {
    type: String,
    required: true,
  },
  itemName: {
    type: String,
    required: true,
  },
  movementType: {
    type: String,
    enum: ['adjustment', 'sale', 'purchase', 'return', 'transfer', 'damage', 'theft'],
    required: true,
  },
  quantityChange: {
    type: Number,
    required: true,
  },
  previousQuantity: {
    type: Number,
    required: true,
  },
  newQuantity: {
    type: Number,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
  },
  referenceId: {
    type: String, // Could be order ID, transfer ID, etc.
  },
  referenceType: {
    type: String, // 'order', 'transfer', 'adjustment', etc.
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  performedByName: {
    type: String,
    required: true,
  },
  costPerUnit: {
    type: Number,
    default: 0,
  },
  totalCost: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Indexes for better performance
InventoryMovementSchema.index({ companyId: 1, itemId: 1, createdAt: -1 });
InventoryMovementSchema.index({ companyId: 1, movementType: 1, createdAt: -1 });
InventoryMovementSchema.index({ companyId: 1, performedBy: 1, createdAt: -1 });

const InventoryMovement = mongoose.models.InventoryMovement || mongoose.model('InventoryMovement', InventoryMovementSchema);

export default InventoryMovement;
