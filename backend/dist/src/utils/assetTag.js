"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAssetTag = generateAssetTag;
const database_1 = __importDefault(require("../config/database"));
const constants_1 = require("../config/constants");
// ─── Auto-generate Asset Tag ───────────────────────────────
// Format: AF-0001, AF-0002, etc. (sequential, padded)
async function generateAssetTag() {
    const lastAsset = await database_1.default.asset.findFirst({
        orderBy: { assetTag: "desc" },
        select: { assetTag: true },
    });
    let nextNumber = 1;
    if (lastAsset?.assetTag) {
        const lastNumber = parseInt(lastAsset.assetTag.replace(`${constants_1.ASSET_TAG_PREFIX}-`, ""), 10);
        if (!isNaN(lastNumber)) {
            nextNumber = lastNumber + 1;
        }
    }
    const paddedNumber = String(nextNumber).padStart(constants_1.ASSET_TAG_PAD_LENGTH, "0");
    return `${constants_1.ASSET_TAG_PREFIX}-${paddedNumber}`;
}
//# sourceMappingURL=assetTag.js.map