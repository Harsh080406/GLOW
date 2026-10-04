import mongoose from "mongoose";

/**
 * Execute workFn inside a Mongoose transaction session.
 * If running on a standalone MongoDB instance without replica set support,
 * gracefully falls back to non-transactional execution.
 *
 * @param {Function} workFn - Async function taking (session) => Promise<any>
 * @returns {Promise<any>}
 */
export async function withTransaction(workFn) {
  let session = null;
  try {
    session = await mongoose.startSession();
  } catch (startErr) {
    // Session initiation itself not supported or failed
    console.warn("[Transaction] Could not start session, running without transaction:", startErr?.message);
    return await workFn(null);
  }

  try {
    let result;
    try {
      await session.withTransaction(async () => {
        result = await workFn(session);
      });
      return result;
    } catch (txError) {
      const msg = txError?.message || "";
      if (
        msg.includes("replica set") ||
        msg.includes("Transaction numbers are only allowed") ||
        msg.includes("standalone") ||
        txError?.code === 20 ||
        txError?.codeName === "IllegalOperation"
      ) {
        console.warn("[Transaction] Standalone MongoDB detected; falling back to non-transactional execution:", msg);
        return await workFn(null);
      }
      throw txError;
    }
  } finally {
    if (session) {
      await session.endSession();
    }
  }
}
