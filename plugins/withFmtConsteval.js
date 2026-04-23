const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const FMT_PATCH_MARKER = "# [withFmtConsteval]";

const FMT_PATCH = `
  ${FMT_PATCH_MARKER} Fix: Clang Xcode 16+ rechaza FMT_USE_CONSTEVAL=1 con args runtime
  ['fmt/core.h', 'fmt/base.h'].each do |header|
    fmt_header = File.join(installer.sandbox.root, 'fmt/include', header)
    if File.exist?(fmt_header)
      File.chmod(0644, fmt_header)
      content = File.read(fmt_header)
      patched = content.gsub(/^(#\\s*define\\s+FMT_USE_CONSTEVAL)\\s+1/, '\\1 0')
      if content != patched
        File.write(fmt_header, patched)
        puts "✅ [withFmtConsteval] Patched \#{header}"
      end
    end
  end
`;

const withFmtConsteval = (config) => {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        "Podfile",
      );
      let podfile = fs.readFileSync(podfilePath, "utf8");

      // Idempotente — no duplicar si ya está
      if (podfile.includes(FMT_PATCH_MARKER)) {
        console.log("ℹ️  [withFmtConsteval] Ya aplicado, skip");
        return config;
      }

      // Insertar justo antes del cierre del post_install
      podfile = podfile.replace(/(\s+end\s*\nend\s*$)/, `\n${FMT_PATCH}$1`);

      fs.writeFileSync(podfilePath, podfile);
      console.log("✅ [withFmtConsteval] Plugin aplicado en Podfile");

      return config;
    },
  ]);
};

module.exports = withFmtConsteval;
