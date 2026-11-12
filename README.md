# مَدار — تطبيق الجوال (الإصدار 1.0، نسخة تجريبية)

شيفرة واحدة (React + Vite) تعمل كتطبيق ويب قابل للتثبيت (PWA) وتُغلَّف بـ Capacitor لإنتاج تطبيق أندرويد و iOS.

## التشغيل على الحاسب
```
npm install
npm run dev        # معاينة أثناء التطوير
npm run build      # نسخة الويب في مجلد dist
node test.cjs      # اختبار آلي لكل المسارات بمقاس الجوال (يحتاج playwright)
```

## أندرويد (APK)
```
npm run build && npx cap sync android
cd android && ./gradlew assembleDebug     # يحتاج Android Studio أو Android SDK و JDK 21
# الناتج: android/app/build/outputs/apk/debug/app-debug.apk
```
أو تلقائيًا: ارفع المشروع إلى مستودع GitHub، وسيبني الملف `.github/workflows/build.yml` ملف APK وينشر نسخة الويب على GitHub Pages.

## iOS
```
npm run build && npx cap sync ios
npx cap open ios      # يحتاج جهاز Mac و Xcode وحساب مطوّر من Apple للتوقيع
```

## بنية المشروع
- `src/data.js` بيانات الوجهة: المواقع، شبكة المسارات، الأسعار، الأنشطة، المواقف
- `src/planner.js` محرك المخطِّط الذكي
- `src/logic.js` الرحلة الجوية وتعديل الحجز عند التأخير
- `src/screens/` الشاشات · `src/ui.jsx` المكوّنات المشتركة · `src/styles.css` الهوية
- `android/` و `ios/` مشروعا التغليف · `public/` الأيقونات وملف التثبيت

البيانات توضيحية والدفع محاكاة، والتطبيق غير مرتبط بأنظمة وجهة البحر الأحمر.
