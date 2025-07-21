// const LIMIT = 5;
// const WINDOW = 60;

// const AI_LIMIT = 10;
// const AI_WINDOW = 3600;

// export async function rateLimit(ip: string) {
//   const key = `rate-limit:${ip}`;

//   const requestCount = await redis.incr(key);

//   if (requestCount === 1) {
//     await redis.expire(key, WINDOW);
//   }

//   if (requestCount > LIMIT) {
//     return { success: false, message: "Too many requests, please wait..." };
//   }

//   return { success: true, remaining: LIMIT - requestCount };
// }

// export async function aiRateLimit(userId: string) {
//   const key = `ai-limit:${userId}`;
//   const requestCount = await redis.incr(key);

//   if (requestCount === 1) {
//     await redis.expire(key, AI_WINDOW);
//   }

//   const timeLeft = await redis.ttl(key);

//   if (requestCount > AI_LIMIT) {
//     return {
//       success: false,
//       message: `Daily AI limit reached. Try again in ${timeLeft} seconds.`,
//     };
//   }

//   return {
//     success: true,
//     remaining: AI_LIMIT - requestCount,
//     resetIn: timeLeft,
//   };
// }
