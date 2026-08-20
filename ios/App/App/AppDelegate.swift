import UIKit
import WebKit
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // キーボードを閉じた後、WKWebViewのスクロール補正 (インセット/オフセット) が
        // 元に戻らず画面全体がズレたままになるiOSの問題への対策。
        // キーボードが閉じたタイミングで表示位置を強制的に正常範囲へ戻す。
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(resetWebViewAfterKeyboard),
            name: UIResponder.keyboardDidHideNotification,
            object: nil
        )
        return true
    }

    @objc private func resetWebViewAfterKeyboard() {
        DispatchQueue.main.async { [weak self] in
            guard let webView = self?.findWebView() else { return }
            let scrollView = webView.scrollView
            // キーボード表示のために加えられたインセットをリセット
            scrollView.contentInset = .zero
            scrollView.verticalScrollIndicatorInsets = .zero
            // オフセットを正常範囲 (0〜最大スクロール量) にクランプ
            let maxY = max(0, scrollView.contentSize.height - scrollView.bounds.height)
            let y = min(max(0, scrollView.contentOffset.y), maxY)
            if scrollView.contentOffset.y != y || scrollView.contentOffset.x != 0 {
                scrollView.setContentOffset(CGPoint(x: 0, y: y), animated: false)
            }
        }
    }

    private func findWebView() -> WKWebView? {
        guard let root = window?.rootViewController
            ?? UIApplication.shared.connectedScenes
                .compactMap({ ($0 as? UIWindowScene)?.keyWindow })
                .first?.rootViewController
        else { return nil }
        return searchWebView(in: root.view)
    }

    private func searchWebView(in view: UIView) -> WKWebView? {
        if let webView = view as? WKWebView { return webView }
        for subview in view.subviews {
            if let found = searchWebView(in: subview) { return found }
        }
        return nil
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        // Called when the app was launched with a url. Feel free to add additional processing here,
        // but if you want the App API to support tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Called when the app was launched with an activity, including Universal Links.
        // Feel free to add additional processing here, but if you want the App API to support
        // tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

}
