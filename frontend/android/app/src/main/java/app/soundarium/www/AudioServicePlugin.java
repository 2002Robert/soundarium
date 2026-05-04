package app.soundarium.www;

import android.content.Intent;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Capacitor plugin cho phép JavaScript start/stop foreground service.
 * Sử dụng: Capacitor.Plugins.AudioService.start({ songName: "..." })
 */
@CapacitorPlugin(name = "AudioService")
public class AudioServicePlugin extends Plugin {

    @PluginMethod
    public void start(PluginCall call) {
        String songName = call.getString("songName", "Đang phát nhạc");
        Intent intent = new Intent(getContext(), AudioForegroundService.class);
        intent.putExtra("song_name", songName);
        getContext().startForegroundService(intent);
        call.resolve();
    }

    @PluginMethod
    public void stop(PluginCall call) {
        Intent intent = new Intent(getContext(), AudioForegroundService.class);
        intent.setAction("STOP");
        getContext().startService(intent);
        call.resolve();
    }
}
