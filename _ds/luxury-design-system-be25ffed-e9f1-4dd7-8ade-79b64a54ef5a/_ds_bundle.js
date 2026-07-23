/* @ds-bundle: {"format":4,"namespace":"LuxuryDesignSystem_be25ff","components":[{"name":"ArticleCard","sourcePath":"components/content/ArticleCard.jsx"},{"name":"CalloutCard","sourcePath":"components/content/CalloutCard.jsx"},{"name":"ListingRow","sourcePath":"components/content/ListingRow.jsx"},{"name":"ModelCard","sourcePath":"components/content/ModelCard.jsx"},{"name":"SpecCell","sourcePath":"components/content/SpecCell.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"},{"name":"TextInput","sourcePath":"components/core/TextInput.jsx"},{"name":"TextLink","sourcePath":"components/core/TextLink.jsx"},{"name":"CtaBand","sourcePath":"components/layout/CtaBand.jsx"},{"name":"HeroBand","sourcePath":"components/layout/HeroBand.jsx"},{"name":"SiteFooter","sourcePath":"components/layout/SiteFooter.jsx"},{"name":"TopNav","sourcePath":"components/layout/TopNav.jsx"}],"sourceHashes":{"components/content/ArticleCard.jsx":"910fd4c5abff","components/content/CalloutCard.jsx":"435cbb21d8de","components/content/ListingRow.jsx":"b36f59cd42e4","components/content/ModelCard.jsx":"24e663239b0d","components/content/SpecCell.jsx":"11fe185aef57","components/core/Button.jsx":"71e1611af1e5","components/core/IconButton.jsx":"6e5200e90635","components/core/Tag.jsx":"477e587e07a0","components/core/TextInput.jsx":"c7f96d7f9b72","components/core/TextLink.jsx":"19ae658fbb33","components/layout/CtaBand.jsx":"e24d58f3fba9","components/layout/HeroBand.jsx":"8e1e0351da88","components/layout/SiteFooter.jsx":"3b069b037c87","components/layout/TopNav.jsx":"28ea00245695"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.LuxuryDesignSystem_be25ff = window.LuxuryDesignSystem_be25ff || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/content/ArticleCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Newsroom article card — hairline border, 24px padding, 16:9 thumb, date, title, serif excerpt. */
function ArticleCard({
  image,
  date,
  title,
  children,
  href = "#",
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("a", _extends({
    href: href,
    style: {
      display: "block",
      textDecoration: "none",
      background: "var(--lux-canvas)",
      border: "1px solid var(--lux-hairline)",
      padding: 24,
      boxSizing: "border-box",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      aspectRatio: "16 / 9",
      background: "var(--lux-surface-soft)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden"
    }
  }, image ? /*#__PURE__*/React.createElement("img", {
    src: image,
    alt: "",
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      display: "block"
    }
  }) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--lux-font-mono)",
      fontSize: 11,
      color: "var(--lux-muted-soft)"
    }
  }, "thumbnail \u2014 16:9")), date && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--lux-font-mono)",
      fontSize: 11,
      letterSpacing: "2px",
      textTransform: "uppercase",
      color: "var(--lux-muted)",
      marginTop: 16
    }
  }, date), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--lux-font-display)",
      fontSize: 20,
      letterSpacing: "1px",
      color: "var(--lux-ink)",
      marginTop: 8
    }
  }, title), children && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--lux-font-body)",
      fontSize: 16,
      lineHeight: 1.5,
      color: "var(--lux-body)",
      marginTop: 8
    }
  }, children));
}
Object.assign(__ds_scope, { ArticleCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/ArticleCard.jsx", error: String((e && e.message) || e) }); }

// components/content/CalloutCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Small floating callout card (#141414, 0px corners, 16px padding, 320px). */
function CalloutCard({
  eyebrow,
  children,
  linkLabel,
  href = "#",
  width = 320,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      background: "var(--lux-surface-card)",
      padding: 16,
      width,
      boxSizing: "border-box",
      ...style
    }
  }, rest), eyebrow && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--lux-font-mono)",
      fontSize: 10,
      letterSpacing: "2px",
      textTransform: "uppercase",
      color: "var(--lux-muted)"
    }
  }, eyebrow), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--lux-font-body)",
      fontSize: 15,
      lineHeight: 1.5,
      color: "var(--lux-body)",
      marginTop: eyebrow ? 8 : 0
    }
  }, children), linkLabel && /*#__PURE__*/React.createElement("a", {
    href: href,
    style: {
      display: "inline-block",
      marginTop: 12,
      fontFamily: "var(--lux-font-mono)",
      fontSize: 11,
      letterSpacing: "2px",
      textTransform: "uppercase",
      color: "var(--lux-link)",
      textDecoration: "underline"
    }
  }, linkLabel));
}
Object.assign(__ds_scope, { CalloutCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/CalloutCard.jsx", error: String((e && e.message) || e) }); }

// components/content/ListingRow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Careers/job listing row — title left, meta right, chevron; hairline divider. */
function ListingRow({
  title,
  meta,
  href = "#",
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("a", _extends({
    href: href,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 24,
      padding: "24px 0",
      borderBottom: "1px solid var(--lux-hairline)",
      textDecoration: "none",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--lux-font-display)",
      fontSize: 20,
      letterSpacing: "1px",
      color: "var(--lux-ink)",
      flex: 1
    }
  }, title), meta && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--lux-font-mono)",
      fontSize: 11,
      letterSpacing: "2px",
      textTransform: "uppercase",
      color: "var(--lux-muted)"
    }
  }, meta), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--lux-ink)",
      fontSize: 16
    }
  }, "\u2192"));
}
Object.assign(__ds_scope, { ListingRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/ListingRow.jsx", error: String((e && e.message) || e) }); }

// components/content/ModelCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Model showcase card — photo on black, display name, mono specs, DISCOVER link. */
function ModelCard({
  image,
  name,
  specs,
  linkLabel = "DISCOVER",
  href = "#",
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      background: "var(--lux-canvas)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      aspectRatio: "16 / 9",
      background: "var(--lux-surface-soft)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden"
    }
  }, image ? /*#__PURE__*/React.createElement("img", {
    src: image,
    alt: typeof name === "string" ? name : "",
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      display: "block"
    }
  }) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--lux-font-mono)",
      fontSize: 11,
      color: "var(--lux-muted-soft)"
    }
  }, "model shot \u2014 16:9")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--lux-font-display)",
      fontSize: 32,
      letterSpacing: "2px",
      textTransform: "uppercase",
      color: "var(--lux-ink)",
      marginTop: 24
    }
  }, name), specs && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--lux-font-mono)",
      fontSize: 11,
      letterSpacing: "2px",
      textTransform: "uppercase",
      color: "var(--lux-muted)",
      marginTop: 8
    }
  }, specs), /*#__PURE__*/React.createElement("a", {
    href: href,
    style: {
      display: "inline-block",
      marginTop: 16,
      fontFamily: "var(--lux-font-mono)",
      fontSize: 11,
      letterSpacing: "2px",
      textTransform: "uppercase",
      color: "var(--lux-link)",
      textDecoration: "underline"
    }
  }, linkLabel));
}
Object.assign(__ds_scope, { ModelCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/ModelCard.jsx", error: String((e && e.message) || e) }); }

// components/content/SpecCell.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Spec value + mono label with hairline divider — vehicle/technical specs. */
function SpecCell({
  value,
  label,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      padding: "24px 0",
      borderBottom: "1px solid var(--lux-hairline)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--lux-font-display)",
      fontSize: 20,
      letterSpacing: "1px",
      color: "var(--lux-ink)"
    }
  }, value), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--lux-font-mono)",
      fontSize: 11,
      letterSpacing: "2px",
      textTransform: "uppercase",
      color: "var(--lux-muted)",
      marginTop: 8
    }
  }, label));
}
Object.assign(__ds_scope, { SpecCell });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/SpecCell.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Transparent outline pill — the only button. Never filled. */
function Button({
  children,
  size = "md",
  href,
  onClick,
  style,
  ...rest
}) {
  const pad = size === "sm" ? "10px 24px" : "14px 32px";
  const fs = size === "sm" ? 12 : 14;
  const s = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    color: "var(--lux-ink)",
    border: "1px solid var(--lux-ink)",
    borderRadius: "var(--lux-radius-pill)",
    padding: pad,
    fontFamily: "var(--lux-font-mono)",
    fontSize: fs,
    letterSpacing: "2.5px",
    textTransform: "uppercase",
    lineHeight: 1,
    cursor: "pointer",
    textDecoration: "none",
    ...style
  };
  return href ? /*#__PURE__*/React.createElement("a", _extends({
    href: href,
    style: s
  }, rest), children) : /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    onClick: onClick,
    style: s
  }, rest), children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** 40×40 transparent circle with 1px white outline — carousel arrows, share, etc. */
function IconButton({
  children,
  onClick,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    onClick: onClick,
    style: {
      width: 40,
      height: 40,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      background: "transparent",
      color: "var(--lux-ink)",
      border: "1px solid var(--lux-ink)",
      borderRadius: "var(--lux-radius-pill)",
      fontSize: 16,
      lineHeight: 1,
      cursor: "pointer",
      padding: 0,
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Transparent mono caption label — dates ("12. JULY 2026") and category tags. No fill, no border. */
function Tag({
  children,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      fontFamily: "var(--lux-font-mono)",
      fontSize: 11,
      letterSpacing: "2px",
      textTransform: "uppercase",
      color: "var(--lux-muted)",
      lineHeight: 1.4,
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tag.jsx", error: String((e && e.message) || e) }); }

// components/core/TextInput.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Underline-only text input — transparent, serif, 44px tall. */
function TextInput({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "block",
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--lux-font-mono)",
      fontSize: 10,
      letterSpacing: "2px",
      textTransform: "uppercase",
      color: "var(--lux-muted)",
      display: "block"
    }
  }, label), /*#__PURE__*/React.createElement("input", _extends({
    type: type,
    placeholder: placeholder,
    value: value,
    onChange: onChange,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      width: "100%",
      boxSizing: "border-box",
      height: 44,
      background: "transparent",
      border: "none",
      borderRadius: 0,
      outline: "none",
      borderBottom: `1px solid ${focus ? "var(--lux-ink)" : "var(--lux-hairline-strong)"}`,
      color: "var(--lux-ink)",
      fontFamily: "var(--lux-font-body)",
      fontSize: 16,
      padding: "12px 0"
    }
  }, rest)));
}
Object.assign(__ds_scope, { TextInput });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/TextInput.jsx", error: String((e && e.message) || e) }); }

// components/core/TextLink.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Inline serif text link — the ONLY place ice-blue appears. */
function TextLink({
  children,
  href = "#",
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("a", _extends({
    href: href,
    style: {
      color: "var(--lux-link)",
      textDecoration: "underline",
      fontFamily: "var(--lux-font-body)",
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { TextLink });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/TextLink.jsx", error: String((e && e.message) || e) }); }

// components/layout/CtaBand.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Pre-footer CTA band — centered display-md headline + pill button, 80px padding. */
function CtaBand({
  headline,
  cta = "Enquire",
  href = "#",
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("section", _extends({
    style: {
      padding: "80px 40px",
      textAlign: "center",
      borderTop: "1px solid var(--lux-hairline)",
      background: "var(--lux-canvas)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--lux-font-display)",
      fontSize: 32,
      letterSpacing: "2px",
      textTransform: "uppercase",
      color: "var(--lux-ink)"
    }
  }, headline), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 32,
      display: "flex",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Button, {
    href: href
  }, cta)));
}
Object.assign(__ds_scope, { CtaBand });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/CtaBand.jsx", error: String((e && e.message) || e) }); }

// components/layout/HeroBand.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Full-width hero band — eyebrow, display-xl headline, one serif sentence, one pill CTA, photo slot. */
function HeroBand({
  eyebrow,
  headline,
  children,
  cta,
  photo,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("section", _extends({
    style: {
      padding: "96px 40px 120px",
      textAlign: "center",
      background: "var(--lux-canvas)",
      ...style
    }
  }, rest), eyebrow && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--lux-font-mono)",
      fontSize: 11,
      letterSpacing: "2px",
      textTransform: "uppercase",
      color: "var(--lux-muted)"
    }
  }, eyebrow), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: "var(--lux-font-display)",
      fontWeight: 400,
      fontSize: 64,
      lineHeight: 1.1,
      letterSpacing: "4px",
      textTransform: "uppercase",
      color: "var(--lux-ink)",
      margin: "24px 0 0"
    }
  }, headline), children && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--lux-font-body)",
      fontSize: 16,
      lineHeight: 1.5,
      color: "var(--lux-body)",
      maxWidth: 480,
      margin: "24px auto 0"
    }
  }, children), cta && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 40,
      display: "flex",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Button, {
    href: "#"
  }, cta)), photo !== undefined && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 64,
      aspectRatio: "21 / 9",
      background: "var(--lux-surface-soft)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden"
    }
  }, photo ? /*#__PURE__*/React.createElement("img", {
    src: photo,
    alt: "",
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      display: "block"
    }
  }) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--lux-font-mono)",
      fontSize: 12,
      color: "var(--lux-muted-soft)"
    }
  }, "full-bleed photography \u2014 21:9, subject in motion")));
}
Object.assign(__ds_scope, { HeroBand });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/HeroBand.jsx", error: String((e && e.message) || e) }); }

// components/layout/SiteFooter.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Black footer — mono column heads, serif muted links, centered wordmark at bottom. */
function SiteFooter({
  wordmark = "MARQUE",
  columns = [],
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("section", _extends({
    style: {
      padding: "64px 40px",
      borderTop: "1px solid var(--lux-hairline)",
      background: "var(--lux-canvas)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1280,
      margin: "0 auto",
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
      gap: 40
    }
  }, columns.map((col, i) => /*#__PURE__*/React.createElement("div", {
    key: i
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--lux-font-mono)",
      fontSize: 11,
      letterSpacing: "2px",
      textTransform: "uppercase",
      color: "var(--lux-ink)"
    }
  }, col.title), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8,
      marginTop: 12
    }
  }, col.links.map((l, j) => /*#__PURE__*/React.createElement("a", {
    key: j,
    href: l.href || "#",
    style: {
      fontFamily: "var(--lux-font-body)",
      fontSize: 14,
      color: "var(--lux-muted)",
      textDecoration: "none"
    }
  }, l.label)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      marginTop: 64,
      fontFamily: "var(--lux-font-display)",
      fontSize: 14,
      letterSpacing: "6px",
      textTransform: "uppercase",
      color: "var(--lux-ink)"
    }
  }, wordmark));
}
Object.assign(__ds_scope, { SiteFooter });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/SiteFooter.jsx", error: String((e && e.message) || e) }); }

// components/layout/TopNav.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** 56px transparent top nav — MENU left, wordmark center (+6px tracking), STORE right. */
function TopNav({
  wordmark = "MARQUE",
  left = "MENU",
  right = "STORE",
  style,
  ...rest
}) {
  const mono = {
    fontFamily: "var(--lux-font-mono)",
    fontSize: 12,
    letterSpacing: "2px",
    textTransform: "uppercase",
    color: "var(--lux-ink)"
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      height: 56,
      display: "grid",
      gridTemplateColumns: "1fr auto 1fr",
      alignItems: "center",
      padding: "0 40px",
      background: "transparent",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: mono
  }, left), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--lux-font-display)",
      fontSize: 14,
      letterSpacing: "6px",
      textTransform: "uppercase",
      color: "var(--lux-ink)"
    }
  }, wordmark), /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono,
      justifySelf: "end"
    }
  }, right));
}
Object.assign(__ds_scope, { TopNav });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/TopNav.jsx", error: String((e && e.message) || e) }); }

__ds_ns.ArticleCard = __ds_scope.ArticleCard;

__ds_ns.CalloutCard = __ds_scope.CalloutCard;

__ds_ns.ListingRow = __ds_scope.ListingRow;

__ds_ns.ModelCard = __ds_scope.ModelCard;

__ds_ns.SpecCell = __ds_scope.SpecCell;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.TextInput = __ds_scope.TextInput;

__ds_ns.TextLink = __ds_scope.TextLink;

__ds_ns.CtaBand = __ds_scope.CtaBand;

__ds_ns.HeroBand = __ds_scope.HeroBand;

__ds_ns.SiteFooter = __ds_scope.SiteFooter;

__ds_ns.TopNav = __ds_scope.TopNav;

})();
