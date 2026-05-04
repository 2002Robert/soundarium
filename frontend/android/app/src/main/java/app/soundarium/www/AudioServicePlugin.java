package app.soundarium.www;

import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.AudioFocusRequest;
import android.media.AudioManager;
import android.os.Build;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "AudioService")
public class AudioServicePlugin extends Plugin {

    private AudioFocusRequest focusRequest;
    private AudioManager audioManager;

    @Override
    public void load() {
        audioManager = (AudioManager) getContext().getSystemService(Context.AUDIO_SERVICE);

        // Cho phép media phát mà không cần user gesture trong WebView
        WebView webView = getBridge().getWebView();
        if (webView != null) {
            WebSettings settings = webView.getSettings();
            settings.setMediaPlaybackRequiresUserGesture(false);
        }
    }

    @PluginMethod
    public void start(PluginCall call) {
        String songName = call.getString("songName", "Đang phát nhạc");

        // Yêu cầu audio focus để Android biết app đang phát audio
        requestAudioFocus();

        // Start foreground service để giữ process sống khi background
        Intent intent = new Intent(getContext(), AudioForegroundService.class);
        intent.putExtra("song_name", songName);
        getContext().startForegroundService(intent);

        call.resolve();
    }

    @PluginMethod
    public void stop(PluginCall call) {
        // Từ bỏ audio focus
        abandonAudioFocus();

        // Dừng foreground service
        Intent intent = new Intent(getContext(), AudioForegroundService.class);
        intent.setAction("STOP");
        getContext().startService(intent);

        call.resolve();
    }

    private void requestAudioFocus() {
        if (audioManager == null) return;
        AudioAttributes attrs = new AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_MEDIA)
            .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
            .build();
        focusRequest = new AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN)
            .setAudioAttributes(attrs)
            .setAcceptsDelayedFocusGain(true)
            .setWillPauseWhenDucked(false)
            .build();
        audioManager.requestAudioFocus(focusRequest);
    }

    private void abandonAudioFocus() {
        if (audioManager != null && focusRequest != null) {
            audioManager.abandonAudioFocusRequest(focusRequest);
        }
    }
}
