import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://qjrhnmdgutgdwqyicaau.supabase.co";
const ADMIN_UID = "d7bb76da-c491-4468-afd4-f7cdda219259";

function hiddenPrompt(label) {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    let value = "";

    process.stdout.write(label);

    stdin.setRawMode(true);
    stdin.resume();

    const onData = (chunk) => {
      const input = chunk.toString("utf8");

      for (const char of input) {
        if (char === "\u0003") {
          process.exit();
        }

        if (char === "\r" || char === "\n") {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.removeListener("data", onData);
          process.stdout.write("\n");
          resolve(value);
        } else if (char === "\u007f" || char === "\b") {
          value = value.slice(0, -1);
        } else {
          value += char;
        }
      }
    };

    stdin.on("data", onData);
  });
}

const secretKey = await hiddenPrompt("Paste Supabase Secret Key: ");
const newPassword = await hiddenPrompt("Enter new Admin password: ");

const supabase = createClient(
  SUPABASE_URL,
  secretKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

const { error } = await supabase.auth.admin.updateUserById(
  ADMIN_UID,
  {
    password: newPassword,
  }
);

if (error) {
  console.error("\n❌ Failed:", error.message);
  process.exit(1);
}

console.log("\n✅ Admin password updated successfully!");