# プロジェクトの詳細
- 開発者:Shinya Hoki
- 開発日:2026年2月12日

# スクレポ自動保存 Chrome拡張

セッション切れによるフォーム入力内容の消失を防ぐための Chrome 拡張機能です。
スクレポ（sukurepo）の講師レポート画面で、textarea に入力したコメントを自動的に `chrome.storage.local` に保存し、ページ再読み込み時に復元します。

## 機能

- **自動保存**: textarea への入力を検知し、500ms の debounce 後に自動保存
- **ボタン押下時の保存**: 登録ボタンのクリック時にも保存を実行
- **自動復元**: ページ読み込み時に保存済みのコメントを textarea に自動入力
- **授業単位の管理**: 「生徒名 + 授業日 + 授業時間」の SHA-256 ハッシュをキーとして使用するため、同じ生徒でも授業が異なればコメントが混在しない
- **プライバシー配慮**: 生徒名はハッシュ化して保存するため、ストレージ上に平文の名前は残らない

## ファイル構成

```
├── manifest.json       … 拡張機能の定義（Manifest V3）
├── utils.js            … 共通ユーティリティ関数
├── content_input.js    … コメントの自動保存処理
├── content_output.js   … コメントの自動復元処理
└── README.md           … このファイル
```

## 各ファイルの役割

### manifest.json
- 対象 URL: `https://sukurepo.azurewebsites.net/teachers_report/*`
- 使用権限: `storage`（chrome.storage.local）

### utils.js
共通関数を提供します。
- `normalizeName(name)` … 名前の正規化（「さん」除去、NFKC正規化、空白除去、小文字化）
- `hashString(str)` … SHA-256 ハッシュの生成
- `getTableValue(label)` … `#names` テーブルから指定ラベルの値を取得
- `getStudentName()` … 生徒名の取得
- `getLessonKey()` … 「名前+授業日+授業時間」のハッシュ用キーを生成
- `isTargetPage(page)` … 対象ページの判定
- `safeStorageSet(data)` / `safeStorageGet(key, callback)` … Extension context invalidated エラー対策付きのストレージラッパー

### content_input.js
- textarea の `input` イベントを監視し、500ms debounce で `chrome.storage.local` に保存
- 登録ボタン（`#dialog1` へのリンク）クリック時にも保存
- `MutationObserver` で textarea の動的生成に対応

### content_output.js
- ページ読み込み時に `chrome.storage.local` から保存済みコメントを取得
- ハッシュが一致すれば textarea に値を復元
- サイト側の JS による上書きを考慮し、段階的リトライ（500ms → 1000ms → 2000ms）で復元を実行
- `MutationObserver` で textarea の動的生成に対応

## インストール方法

1. このリポジトリのファイルを任意のフォルダにまとめる
2. Chrome で `chrome://extensions` を開く
3. 右上の「デベロッパー モード」を有効にする
4. 「パッケージ化されていない拡張機能を読み込む」をクリック
5. ファイルをまとめたフォルダを選択

## 拡張機能の更新方法

1. ファイルを差し替える
2. `chrome://extensions` で拡張機能の「更新」ボタンをクリック（または一度削除して再インストール）
3. **対象ページをリロードする**（リロードしないと「Extension context invalidated」エラーが発生します）

## 保存データの確認方法

対象ページの DevTools コンソールで以下を実行：

```js
chrome.storage.local.get("lastComment", (data) => console.log(data));
```

## 注意事項

- 保存データはブラウザのローカルストレージに保存されるため、別のブラウザやプロファイルからはアクセスできません
- サイト側が textarea に値を設定している場合（サーバーから取得した既存コメント等）、拡張機能による復元は行われません
- 拡張機能を更新した際は、対象ページのリロードが必要です
- 本コードは配布先本人の使用に限られます。開発者の許可なく、無断で第三者に譲渡・配布したり、開発者名義以外で同様のものを作成・頒布することを禁止します。

- 本注意事項に違反した場合、違反者に対しては 損害賠償請求、使用停止命令、法的手続きの実施など、開発者が必要と判断する措置を講じることがあります。
