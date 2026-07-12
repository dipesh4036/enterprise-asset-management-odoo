import prisma from "../config/database";
import { ASSET_TAG_PREFIX, ASSET_TAG_PAD_LENGTH } from "../config/constants";

// ─── Auto-generate Asset Tag ───────────────────────────────
// Format: AF-0001, AF-0002, etc. (sequential, padded)

export async function generateAssetTag(): Promise<string> {
  const lastAsset = await prisma.asset.findFirst({
    orderBy: { assetTag: "desc" },
    select: { assetTag: true },
  });

  let nextNumber = 1;

  if (lastAsset?.assetTag) {
    const lastNumber = parseInt(
      lastAsset.assetTag.replace(`${ASSET_TAG_PREFIX}-`, ""),
      10
    );
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  const paddedNumber = String(nextNumber).padStart(ASSET_TAG_PAD_LENGTH, "0");
  return `${ASSET_TAG_PREFIX}-${paddedNumber}`;
}
