package com.domutala.drivers.fullscreen;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import android.app.Activity;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;

@CapacitorPlugin(name = "FullscreenPlugin")
public class FullscreenPlugin extends Plugin {

  @PluginMethod
  public void enable(PluginCall call) {
    JSObject modes = new JSObject();
    modes.put("all", View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
        | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
        | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
        | View.SYSTEM_UI_FLAG_FULLSCREEN
        | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);

    modes.put("status-bar", View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN);

    String mode = call.getString("mode");
    // var flag = modes.getInt(mode);

    Activity activity = getActivity();
    // Obtenir la fenêtre de l'activité
    WindowManager.LayoutParams attributes = activity.getWindow().getAttributes();

    // Activer le mode plein écran
    activity.runOnUiThread(new Runnable() {
      @Override
      public void run() {
        View decorView = activity.getWindow().getDecorView();
        decorView.setSystemUiVisibility(modes.getInteger(mode));
      }
    });

    JSObject result = new JSObject();
    result.put("mode", mode);
    call.resolve(result);
  }

  @PluginMethod
  public void disable(PluginCall call) {
    Activity activity = getActivity();
    // Obtenir la fenêtre de l'activité
    WindowManager.LayoutParams attributes = activity.getWindow().getAttributes();

    // Désactiver le mode plein écran
    activity.runOnUiThread(new Runnable() {
      @Override
      public void run() {
        View decorView = activity.getWindow().getDecorView();
        decorView.setSystemUiVisibility(0);
      }
    });

    // Indiquer que l'opération a réussi
    call.resolve();
  }

}
