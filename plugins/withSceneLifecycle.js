const { withInfoPlist, withAppDelegate } = require("@expo/config-plugins");

// iOS 27 truena al arrancar (EXC_BREAKPOINT en
// _UIApplicationEvaluateRuntimeIssueForNoSceneLifecycleAdoption) si la app no
// adopta el ciclo de vida basado en UIScene. Expo 57 ya trae ExpoAppSceneDelegate,
// pero el template de prebuild todavía genera un AppDelegate basado en window.
// Este plugin registra el scene delegate y adapta el AppDelegate.

const MARKER = "// [withSceneLifecycle]";

const withSceneManifest = (config) =>
  withInfoPlist(config, (config) => {
    config.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: "Default Configuration",
            UISceneDelegateClassName: "EXExpoAppSceneDelegate",
          },
        ],
      },
    };
    return config;
  });

const withSceneAppDelegate = (config) =>
  withAppDelegate(config, (config) => {
    if (config.modResults.language !== "swift") {
      throw new Error("[withSceneLifecycle] Solo soporta AppDelegate.swift");
    }
    let src = config.modResults.contents;
    if (src.includes(MARKER)) return config;

    // 1. El AppDelegate debe exponer la factory al scene delegate.
    src = src.replace(
      /class AppDelegate: ExpoAppDelegate \{/,
      `class AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider { ${MARKER}`,
    );

    // 2. El scene delegate crea la ventana y arranca React Native; quitarlo de aquí.
    const windowBlock =
      /#if os\(iOS\) \|\| os\(tvOS\)\s*window = UIWindow\(frame: UIScreen\.main\.bounds\)\s*factory\.startReactNative\([\s\S]*?\)\s*#endif\s*/;
    if (!windowBlock.test(src)) {
      throw new Error(
        "[withSceneLifecycle] No encontré el bloque startReactNative en AppDelegate.swift; revisa el template.",
      );
    }
    src = src.replace(
      windowBlock,
      "    // La ventana y React Native los inicia ExpoAppSceneDelegate (UIScene lifecycle).\n\n    ",
    );

    config.modResults.contents = src;
    return config;
  });

module.exports = (config) => withSceneAppDelegate(withSceneManifest(config));
