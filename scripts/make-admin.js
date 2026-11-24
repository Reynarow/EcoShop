require("dotenv/config");
const { Client } = require("pg");

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ خطا: متغیر محیطی DATABASE_URL در فایل .env تعریف نشده است.");
  process.exit(1);
}

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const targetEmail = process.argv[2]?.trim().toLowerCase();

  await client.connect();

  console.log("==================================================");
  console.log("🛠️  اسکریپت امن انتساب نقش مدیر (ADMIN) به کاربر");
  console.log("==================================================");

  if (!targetEmail) {
    console.log("⚠️  ایمیل کاربر مشخص نشده است.");
    console.log("📌 نحوه استفاده:");
    console.log("   npm run make-admin <user-email>");
    console.log("   مثال: npm run make-admin admin@example.com\n");

    console.log("📋 لیست کاربران ثبت‌نام شده در پایگاه داده:");
    const res = await client.query(
      'SELECT id, name, email, role, "createdAt" FROM "user" ORDER BY "createdAt" DESC'
    );

    if (res.rows.length === 0) {
      console.log("   (هیچ کاربری در دیتابیس ثبت نشده است. ابتدا در سایت ثبت‌نام کنید)");
    } else {
      res.rows.forEach((u, i) => {
        const badge = u.role === "ADMIN" ? "👑 [ADMIN]" : "👤 [USER]";
        console.log(`   ${i + 1}. ${u.name} | ${u.email} | نقش: ${badge}`);
      });
    }

    console.log("==================================================");
    return;
  }

  // بررسی وجود کاربر
  const checkRes = await client.query('SELECT id, name, email, role FROM "user" WHERE LOWER(email) = $1', [
    targetEmail,
  ]);

  if (checkRes.rows.length === 0) {
    console.error(`❌ خطا: کاربری با ایمیل "${targetEmail}" در پایگاه داده یافت نشد.`);
    console.log("💡 راهنمایی: لطفاً ابتدا از طریق صفحه /register در سایت ثبت‌نام نمایید.");
    process.exitCode = 1;
    return;
  }

  const user = checkRes.rows[0];

  if (user.role === "ADMIN") {
    console.log(`ℹ️  کاربر "${user.name}" (${user.email}) از قبل دارای نقش مدیر (ADMIN) می‌باشد.`);
    return;
  }

  // ارتقا به ADMIN
  const updateRes = await client.query(
    'UPDATE "user" SET role = $1 WHERE id = $2 RETURNING id, name, email, role',
    ["ADMIN", user.id]
  );

  const updated = updateRes.rows[0];
  console.log(`✅ موفقیت: نقش کاربر "${updated.name}" (${updated.email}) با موفقیت به ADMIN تغییر یافت.`);
  console.log("🎉 اکنون این کاربر می‌تواند به پنل مدیریت (/admin/products) و روت‌های امنیتی دسترسی کامل داشته باشد.");
  console.log("==================================================");
}

main()
  .catch((err) => {
    console.error("❌ خطای غیرمنتظره در اجرای اسکریپت:", err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await client.end().catch(() => {});
  });
