package app.soundarium.www;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Đăng ký plugin trước khi super.onCreate
        registerPlugin(AudioServicePlugin.class);
        super.onCreate(savedInstanceState);
    }

    /**
     * Không gọi super.onPause() → WebView tiếp tục chạy khi app vào background.
     * Đây là key fix để YouTube IFrame audio không bị pause khi lock screen.
     */
    @Override
    protected void onPause() {
        // Intentionally skip — prevents WebView from pausing audio on background
    }

    @Override
    protected void onStop() {
        // Intentionally skip — keeps WebView alive in background
    }

    @Override
    protected void onResume() {
        super.onResume();
    }
}
