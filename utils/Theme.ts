import { StatusBar, Style } from "@capacitor/status-bar";
import { Capacitor } from "@capacitor/core";
import "@hugotomazi/capacitor-navigation-bar";
import {
  type ColorParameters,
  NavigationBar,
} from "@hugotomazi/capacitor-navigation-bar";

function nativeThemeMode(): "dark" | "light" {
  let nativeThemeMode: "dark" | "light" = "dark";

  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    nativeThemeMode = "dark";
  } else {
    nativeThemeMode = "light";
  }

  return nativeThemeMode;
}

function setTheme(newTheme?: "dark" | "light" | null) {
  let theme = Store.app.theme;

  if (newTheme !== undefined) theme = newTheme;
  else {
    if (theme === null) {
      theme = nativeThemeMode() === "dark" ? "light" : "dark";
    } else if (theme === "light") {
      theme = "dark";
    } else {
      theme = null;
    }
  }
  if (Store.app.setTheme) Store.app.setTheme(theme);
}

function init() {
  const darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  darkModeMediaQuery.addEventListener("change", (event) => {
    const darkMode = event.matches;
    if (!Store.app.theme) {
      dispatchEvent(
        new CustomEvent("theme:change", { detail: darkMode ? "dark" : "light" })
      );
    }
  });

  const theme = Store.app.theme;
  Store.app.setTheme(theme);
}

function update() {
  return new Promise<void>((resolve, reject) => {
    setTimeout(async () => {
      const computedStyle = window.getComputedStyle(document.documentElement);
      const color = computedStyle
        .getPropertyValue("--v-theme-background")
        .trim()
        .split(",")
        .map((x) => parseInt(x));

      if (Capacitor.getPlatform() !== "web") {
        await StatusBar.setBackgroundColor({ color: Color.rgbToHex(color) });
        await StatusBar.setStyle({
          style:
            Color.getBrightness(color) === "light" ? Style.Light : Style.Dark,
        });

        const colorOptions: ColorParameters = {
          color: Color.rgbToHex(color),
          darkButtons: Color.getBrightness(color) === "light",
        };
        await NavigationBar.setColor(colorOptions);

        dispatchEvent(new CustomEvent("theme:update"));

        resolve();
      }
    }, 100);
  });
}

export default { init, set: setTheme, update };
