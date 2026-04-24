import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

// ── Canvas: flowing financial data streams ─────────────────────────────────────
function DataStreamCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const COLS = Math.floor(window.innerWidth / 28);
    const drops = Array.from({ length: COLS }, () => Math.random() * -100);
    const chars = "₹$€£¥0123456789.%+-×÷=∑∞▲▼◆●";
    const draw = () => {
      ctx.fillStyle = "rgba(4,2,16,0.06)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drops.forEach((y, i) => {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const progress = y / (canvas.height / 28);
        const alpha = Math.max(0, Math.min(0.15, progress * 0.035));
        ctx.fillStyle = `rgba(99,102,241,${alpha})`;
        ctx.font = "13px monospace";
        ctx.fillText(char, i * 28, y * 28);
        if (y * 28 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i] += 0.4;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", opacity: 0.55 }} />;
}

// ── Navbar ─────────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <motion.nav initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 90,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 48px", height: 64,
        background: scrolled ? "rgba(4,2,16,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(24px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.05)" : "none",
        transition: "all 0.3s",
      }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <motion.div whileHover={{ scale: 1.08 }} style={{ display: "flex", alignItems: "center" }}>
          <img src="data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAEhAUkDASIAAhEBAxEB/8QAHAAAAAcBAQAAAAAAAAAAAAAAAAIDBAUGBwEI/8QAWxAAAQIEBAMEBQYHCgkLBQEAAQIDAAQFEQYSITEHQVETImFxFDKBkaEIFSNCUrEWJGKUssHRMzRDU2NygpKz0yVUVXODk9Lh8BcmREVGZYSFoqPCNTZWZHR1/8QAGwEAAQUBAQAAAAAAAAAAAAAABAACAwUGAQf/xAA1EQACAgIBAwIEBAQGAwEAAAAAAQIDBBEFEiExE0EiUWGhBhQykSNxgbEVM0LR8PEkUsHh/9oADAMBAAIRAxEAPwDyOYEAkXgRejAQIBOkchoge2OadY4fOBYdYQuwI6NjBPrQfKTsYQzZwa9YMkX3NreEdCTpbQw4S2TvHUhjkkIhN+fwhRLfIn4Q5Q1caCFWmVK02h2iKVqQ2Q0RyHmBCqWjb1bw8RLm402+MOG5ZR8L8ockCyyEhghg2FoWTL363iRblfAQ6ZlQU7WN4eog8spJEQmV8Lwb0U39U7dYm/Q1JF8osesF9HQk2WoD74T0iB5iIkSpsO4uO+i/kj3RNolApOjTh6Hs1fsg/oSgNWnAPFpQ/VDdx+Yz86t+SAMqoE2HIQT0XvG4ifMulJOirW17p/WIJ6Oknum9+oKY4pRfudWYivrlSDfN8ISXLnWwixuSRt6oPthBcrysY72JoZi+ZX1M+B0hJxnoInXpW17Aw1dl7aW5RzQTDITIVbWkE7E9Yk1S+pJAtaG6mFpVoR5WhgTC5DZLXjC7KFW05GDJa7+t4cst2N+W0NGyt7B5VpRPjEpKMEJPWEpNnUaGJqQlgojX4Rxsq8rIUUKSErdQ0ifkpG6QLawpS5EZh3fhFlptPGl9oglYZLP5HpIyWpxIFgb+MO/mo+MWeTpwUoJShSjfQAXPwiblsOzDtgWA2D9ZagD/AFdTEDuWzMW8rLfZmcP09xI0BtEbNS+S6SkknYJSVH4Rt0pgplzKp/tn087DsUfHUxNS2HZClNl2RYYYfuAMiAV3JA9dXe67GGSyGl2RPTyzj30zzJUZMtrUFtKS6BcoWhSSLi4Nj1BiCnpfKTofIxo2NXfnLFFUqBJcEzMrKSTukEpRfroBFNqLFgopObTTS0F02NxWzZYGX1pFRnGiACNQdPKG3ovgImZ5qyTpbwiMyufbV74KNJVZuJWbDoIECOQwuzg1UbmBp1gGw1tBNVHQRw42HgQUb2g6Bc77eEdGNgCSbWELttkHaDNNGwEO2msxANxHUiGdiSEWmCTciHTUuom1odMSwtzh6xLd0WBieMAG3JSGTEqrXSHbMrcgWESTEorQWO4GwN79ANSY0vBHBzEddDUzOJRRpBwApemQC6scilGl4f0oq8jka6luT0ZYmVG5SLgXHW3M6africw5hLEGIV5KJSZqeAPecQmzY81EAJj0lQeFmBMMMomKky3U5pIB9InzcE/ks+qBfreLJO4mlGUpal5YulsBKS5YJTYcgNAPAQnEzWX+Ja4PVa2YhhzgRXptQVV6nK0xNh9GyPSnL+Ysn4xeaNwTwlTilVWfnJ8ga+kTIZSTz7qACPK8SU/iipPXBmS2g/VQQkeURa6kVa3uet4jk0iiu5vMu8PRZJHCXDemKIl6RSh17SXVMW9rmaJ6nTlApzZTT0ol02GkvLNtj4ARnonV6EXhdM44TYXiCUgGWZk+7NH+f5M7GcPjnteOitynP04f6U/tigNzTnMm/KF0TCxqSYFm2R/nbkXldTp0wnK47MkHkqyh8Yi5zD2Dqms+kylMcWrf0iQZJ/rZQr3GIFM27a2bSFmpxSRYEi+9jvAsrZL2Hx5W2PkSqPB/AlQbX6NTJZDiiTnlZtxsg+CSVJ+EUut8A2kpccplam5cfVbmpYPC/wDPRqB5iL76VoNfK0PZeqTrIHZTSwBy3HuiL820G08/KD7t/wBzznXOE+M5FK1y8izU2UXuqTdClD/Rmy/gRFBnpN6Vmly85Luyz6FZVIeQUqSedxYCPaoraHkJRPybUwkfWI7w/ZBanSsOYklhKTiZd9tQsGJ1AcCf5hIunzBiaGfL5l9h/iCM9Ls/seHly4y6WB98N1MEc79TaPUOL+ANOeK36E47SzbuoTd9lR8bnOn4xj+LcA4jwyb1KnrEub2mmPpWljkQQLp9ogyvLhLyaGnkoS8djPCwRaw9sLNseB3iTVLHcZT5RxLOXcHeCuzWwr81sNJMapMW/C1EqNXmDL0yRfmnUi5DaLhI630A9t7RXJRHjz6RasNTc3TZ5idkJlctNN+qtJIuOhty8IGtbS+EqM+5uL0aNROHdWKgJ55iR/JR9Ms+7SLnScDycsB2wW+ds768g/qpsfYTCOBcZGpIDE0lLc3a6kDupWOakeX2YvLLvbJDjdikjcGKuO5y1JmAybJWSam+42pOHJRuyBZQ+yhOQfCLLJ0Jppv6OWQjTkkXhTDzCFOJudecXeVlWuyGg2g6ShUl2NPwPAV5kOpozarU11oFWoF9orNbmPQZEu/YzuG3glX641bEUu12StB7ox7iQsIp0w2nRSWtLc8yrW90MvalDZSc5x35G7pizDKs0EWVsrrFcqSPoztFvxAlGtrbxVp9IyHu30iWC0i14qb7FUn0DMe98Ij+zT9oe6JWoCxOtrRF5FfbV74LXg2tMn0lMjl7QDvAO8NNM2FUcxjoBG0dsL7QdpBPePkBCSI29AQ3cg9YdNtAjSOtNkm1oey8uVcofGLYPO1JBGWTeH7EvtCjEtqNNOcS9IpcxUJtuUkpZ2YfcNkto1O9h5CJ41lXflLTbY0lmQlIKxoDrfS4HIf8axofD7hpXMVZZhtAp9NCrKm5kWCvBCdCo/CNC4fcIadSWk1XGCmX5hsAmWJ/F2T0Ur66htl2i51jF7bDQYpQQ2hKcgeULAAaWQkaAdIIjW2Yvk/xAlL08fvL5+wMMYLwhgVluYDYeqKR++nkhb6j+QjZu/v8YUrGLn1BSJS0ogkkkqzLV7YpsxVZh95S3HFqKjclWqiepMJyzEzNvhlpsuqOuRI08yYeq0jN3SuvfVax9NVR5xZK1Falbkm5PnDNc04pZKiYnpHDWRvtZ2ZaYsvKQOvTMdL+AEJYhl6dJtNsy7S0vK76lrcuUp2FxtcnW3IRDOLZHFVp60QeYqG8LMtKWpIsTfnHZZrtFA5SkbEHlFtoFBLjCpiaPYSyQVqWVAZgNDvsBEPpkk5LxFdyCkac++pLbYU54JH64sElhxxa+zcWlCxrkSM6/aLxVMacXKPRQ5IYSk255xBKDNuXTLpVsbbFZ+EZLiHGmKsQZxVK5NuMHRTDJ7FlPmhNgD53PjHHWkg6jhMi9dVj6V9z0c9TJCSOWZqLDRvr2ikN/BSxaF5Wky80n8UmWJkb/RqCrf1VG8eU5VhtwglJPmbxOSMijQhJB3uCQYhlCPyO38LTWu83s9EPU51teXszmFzYAi/v28oaGXUnkfbGa0DEOJqW2luWqjzzIAtLzI7ZFhyAV6vsi+UDFcjViiXm0Ips9YBKCrMy6fAnUeAJgWymL8FFk4U6+8HtfcdEZSQSfdBkrItZQA8oeONHMUlJQscjrCCmsp3v4xX21afcAi0w7TitjqPCHLbhBOp13hrld9Bfckpb0uZQkqbaDpR2ltxmANiLHQxC0XHWFqsQ0ZxVOmlGwZnU5O9zAcT3T7cp8oBnjyf6Q6nBttj11rei802qTErl7N09nzSTcH9kSyZ2mVBCkTLYlVrBBUgd1V983IjziqOIU0Um+fMAoagXHW9iCPImOtv5h4X5H/jSIPWnT5C6OTvx/hn3X1K9j/g7Q6qhc3TAKfMEFXbyaAWlH8tvYDxSBGCYrwnXcMTWSrSdmFKPZTDQUphzxzbp8lR6pkag/KqJYdsCe8k7KELz4pNSlnBOsMt9sCHW3EpKHEgXJUk6W/K3g3Hz34RfYXNp9vt/szyFKta+tz8P1RP0hvKq2trwpitGHVYkmBheWdapqSEoK1qUhSuZTcXCel+UHkFBBQkJKlbAJvmN9tPPSLjrUo9RZZVjnHsWWmA5m0oSoqKxkCL3KuoPIxtGFmag3LIVPO53QCHDawUv7tOZ5xXOG2EXZQ+mVJGSbsAu51ZFvUB5KPUbbRenVthAaZCUtpFhlFhFXdcpTMpkV7l1MlqPNhpwG/OLXL1dCW/W5RQJftFFJToN1GFkTwczoacLikGxAMGwtjNfEWXHcxdhR1EsNdqiHRlCt/GMg4kzJK1pCt1gf1QTF5UXHHQFkmx1PlGTcTZ/LNstg6kOO+d1ZQPcDDbGpNRRW52Tbn3JzKNXnE9/3CKxUlWRaJWpTAU6bquAeYiv1F9JBN+UFxj3NDxlDikQtQKdb303iM/pK98Op9y4Pj4wwznr8YKRsqIfCVEnU6QLGBckQo0kk6i8MNC2dZRdOqb6w4Zb73q89I60m4ABtr0h/LtAnUn3Q+K7gttiSDysvmt3NTEnLyxsBaxgsoynTc+MXvhxgydxTUOyZ+hlGiDMTSk9xAP3q5WgyuJRZmbGqDlJ6SGWDMI1PEtRRJ02XBy6uPLNkNDqpW3kBrHojDGG6Dw+pQcZQp6bcRZb+X6eY01t/Fo8PfD2XRRcFURFMprKG1JAUG1m6iebjhG6jvblyil1qqPTk0pbiy64o6rP6ug8IKqq33Z53yHK258uivtAdV3EEzUHAc6UtpJDbbZshI8OvnEOlD0w7lTmWpWgy3uo9BEhRaLOVeZCG0KURqpZ1SkdSevhEviCuYa4dyyQ4fnCsrT9Gy2sBRBGhUTo0n4mJJtQBseltqFUdsNS8L9nLrm6q8WGm0ZlthaQbb3UrZPkIrmJOKFEpTapLCsm1OqToJgnJLJNuQ9Zw+ehjN8YYwreKnQuqzVpZBu1JsgpaR005nxOsQLaXZh1DTYJU4tKU25qJy/74GnJyNFjcPGPx3vb+Xsbbw2eqdWZfxnimfefS0lSZFJGRttKRZakIGgJPdFud47NzDk9OuOvp7yz3gNkjkB7NIk8TttYfw9TcNyq/o2W0hxSdL5Nc39Jdz7YiaGy6/MoZb7y1qA05mHKGloocqyM5yt8L2/kW3CdIZmFKmpxQTKt3U4Vm2a2uvQDrGU8YeJbmIJpyi0Z1TVEZUAsoGQzZGgUf5Ick+UWzj5igUPD8vg6nPFt2ZbzzhSdUMjYealXPlHnqaeA8D90QTLzgeO3H17F3fgcqmAFXGhtbSFWXc6hYJ6bRDKduUgEQ8p7n0mvIxFORprKemJb6SyXCNBFxolMW6pIQg66WAuTFZw2ApKSY9A8HsPsOyjc+62FLeOVq4vlANiYrr7NdjG8lOydqqh5ZVZLCFTUwFpkXiCLg2EM6hQXWklt1pSCCbpUnmI9OylEa7H1ALjpFTx1h5h2TcISAtOqSBrpygVWEGd+H8zFo9dS2ZNhKtKS41Rqm6VKPdlX1qsR+Qo8/AmLJMpKCQsZSnQptsYzrEoSFGwsTrbpzi14Rq6qxQwpxZVNy30MyVG5UAklKvMiwv1iXXXEz1lXXX6qXf3JZh3sHg52h0UBcbi20Y7xrpIo+I0VOWbySdWBWEgWCXUn6Qe31xbraNbWCCdYgOJ9K+euHlRQlsrmJMCbZIP8We+B5pUfamB6pOuZY8Jk+lkqL/TLsY5hvGVfw8vs6VPksKN1Sz6c7KuvcV6p8RrGq4U4mUGrqbZq7Qos2QEoWpZcZcP886p8idIwVThCQAcw5mDIfIzanbXxgy/BquW/c2WVx1OTHUo/1PW7DLjgQUHO2sZ0FKgUkb3BGhBGuY6Rk/FPGQqbj2HaRMAyQX2c0+hX76UD+5oP2B1Git4z6l4lrkjRpmjydVmmZCYSA8whfdNjfQ7ovsbb84TllhCDdSQgCyu8NBAOPxsap9cisxeJhiTc/PyHLDFkjIklVwAANVHpaNn4R8P5hBZq9VQUTRTnZQRf0VJFws8u0PIcoQ4LcPnZ51mv1WWGwXKS603DaTs6u/1julPTWNkn322W/RJaxA1WrmTfXXziLMyl4j4Cbv0ty8f3I6bcZaaTKyiAloDdOx/bCEs0t1QQm9uZMLtsLmXA20m9zc9BDbFNVk8N0p5b7xbDabuO21TfZIvuT8Irak5vZTPHna/Ul4G+Jq1J0WnOqddCUoFiQe8tX2Uj74z+lY3mGamtyf0lnCSkJGsvyBH2vEe2KXiPEk1XakZyYJaQknsGQr9yF/0up5xFKnlAG1x7Yt6sd67kcsWUz0hKVWVflC82ptZyEoWlVwsWvce+ML4nTYOMp2XS5mblkNNp8Dkur4kw2wrjCaoM0EOIVNUtavp5cH1dPWQeR623itV6qfONYqNRsbTU048M2hylRtceRjtVE1P4g3EwJqe5eNDadfCAQTrbWK7UJgWNjpDqemsxIVprrEFOPcri1otIxNXhYutDacdFvVHuhl2qfsp90CZcJBuR4CGvaq+yn3RKjQ1VaREIRqADrzEPGUE2FoTZSL3trD+UazHYxyMQu2ekHlWCTtErLMWGv3R2RlxcXEWnC1AnK3VGKbJNlTzxAGmiU81HoBBdVZRZWXGCbk+yFcAYTnMUVZEpLgtS6bLmHynRCBvbx8I9FhynYKoLVMprSEOpTdlvKSU9XFnmownR6XTcDYbbl5RKS6dQtWhdXbV1f5I5CKLWJ96amlOLUpS1nMpR3vB1dSPNuQ5CfJXdEe1a+4rO1N6ZmFuLcK1qN1KJ3PWJfCdBdqjqXlhbcvcAqsMyz9lAOhJ6nQbwxwlQF1OYDz2kqhViRoXDvkBOwHNXLaK/xW4koDTmGsLPJRLWLM1NMkgODbs2zuEi1ifrc4dbZ0LQ7Fw55FiqqXb3fyLJxB4kSOHmV0HCQaVMIOR6ZQMyGjzSgn119VHblGGzs85NTTs1MPrffeUVuOrUVKWSbkknUkxGOzGVNgq4hAzJKtdSYC9Tfk2eHx0MaOoIkw4M14t/CGQFT4jUVhVihDqniDqLNpK/ja0UFt4nxN41L5Oye14hNOEatSb6h4d236z74UHtnOQTqonL6MvWL3jM4kfSokhspbBJ5pETnDeRL9RLwABZbzJt9oi3v0MV6t96uTZ5+kr/AEjFmoi3JDB1dqDKyhxmUecSoGxBRLuEEHlY6wZPai2efPU1Cv5tHnbiViBeIMXVWrhZyOvHsuWVpAytjzsBFOmnk6225Q9mx3ATod/IxETJuo7mK2T0j1XEqjGKivYP2gBHLXbrEhIL723OIYkpvqbG0PpF0g2udDEEgm6rcDSsMLBCQT0j0rwWqTC6Iw0LZ5dRSsE8iokR5Rw/PhNjmAItyjS8I4lmqY+mYlXQkm1wrVCx0I6+MAZEG+6MHyVdlN6tivB7HlKm2pgDMNorONKqw3JPLWsAJB+6MpluJ30AvKLSbbB+8V3E+NJuppUkkttn6gVy8esCxUm9aFn/AIjtysf0FHuQmIns7qlEi/OE+G0+WcYtyRXZmfbU0pN9M6RnQfPMm39I9Yg6pUM5USq5PjEfQqgZfE9LmU+s1OMq0/nj9sWFdWkV2JhP0nGS9jcnAE3tqOULUcNPTSGH0pU05dtaVC4KVCxuPG598FqTYamHG03sFEC3S8R8zVKdQpYVStzjcnKpUMpUe84Rc5UpGt7+yAbItyKPGrslbFVrbTPMUyyuXmFy6hZTS1II8jaEW031JOu+kSlTeanqtOTjba2235hbqEqFlJClEgHx1grLAKgLKJOgSkXvy2GpN+kWsfhgnI9NVml3EWiBZZvZNhcch+28bTwV4auz7svXa9LJUjKHZaUc9UJ3DjvhzCffDzg/widdeZrWI5Sy02W1JuJ7rPMKcH1lcwnlz1jZp+cZlGTJyN1G93HTupXMk8z4xTZuZ20vAFlZEa4dT8C81PNSbPocmpS1X+kcPrFXMnxvEew2t51LbabqVppyho2FuuJbSCpajoka38YlZqbk8N01czMustzAQXFqcVZDaealHp4czFPCMrZFRTKzNn1S7QQpV56Sw1Snnn5htlSU5nn16paHl1OwEeb8c4qfxRVAtAcZp7KiZdpZ1JO7jh+2enK9hCPEXHj+K6kWm3nEUxtf0YWQFTCua1jp0B22EVuSEzUJ5mQkWVzE1MLCGmkWuo9fIDcmLujHVceufgsZw32S0kSNJkJ2s1Rml01gOTT2qULUEpSAPWUeQhpWpSfpNSeps/LqZnGtSgm4WORSdikjW8bdgPDElhqn2dV6VNTABm30fW6tp6JB584n8dYJpWKqGnllSTLTbYuuWV4D6yCd0nziJZ6dml4BMa6Fk3GPdI8vTC7jQ5hyMRs25lvzFosOJqLUKDVHKVVWA3MIFwUklDyDs4g8029sVmcBKdxFvW4yj1IusZLwR03MAgk3JiGmXCTEhNg6xFTGiomSL/Giuw2fVmJ1Huhtr9se6FHibkg84JHS0j4Oy7RJA8YlJRvXTTWG0sgGx6xLSTI0iaEQHKu0iQp7V1ISElRUoWA3J6R6Q4U4YYwthxVUqSAicfbC5gkaoQRdLQ8ToTGe8C8H/O1SFanWQuUlF2ZbUnR53x/JH3xouNq52jnocq6VMMkgrJ9dR9ZZ62MHUQ2ecfiHkZWWflan/MjMS1V6oTq3XgOQIB0SOQENsOUZdWnMrlwkd5xQ1IG2gG5JhpIsPT023Ltt3W4dATe2u5MSvEPEzOD8Ot0ikv2qk0kqDgNlMpOheP5R9UcwNYMsariU+NjylJU1+SB4w4zRIyrmFaC4GsiC1OONH1E31ZQR4+urreMNmniCb3BtYw8qMyFAWJ66xBzbu9yb2ipslt7PROMwoY9ahFHHX9YIHTnHQwidQFXvB0gkg5efWINsulBaH8urXQfGNU+TjM24lS8uTq9KvoH9QmMoZRfbrFr4cVtWF8Y0+uqZW6iVdOdCDqpCk2IiWEtPZV8hT61M4L3Rt1bGWuz2gNphZtcDQqMWOlsqm8FYgkWu8tck+lI39ZhY/UYprnGDCTiipdBqBJ3UpLZJ87i8P6RxlwTKuEmmVVKFW7VKJZsgghQOyxffpBtlsXFpM86hxWbG2DcOyaPOUzroekRj4JVYRNzzTZmXCwVlntFdmVpyqKb6Zhc2NuVzEc4yQo31MV77nptE0kRpCtiIUZKkqG4hx2JzbQEMxE0FOyOh/ITJbUCCYs9Kqq0kG4v1ioNNm4IO0P2FFB0hjgVeXj12ovzNYvoSPGOTVVUdAeUVBqaUOsLCaKtLmOKtFI+MhGWyTmZ5S7nPc9IJR5xCa3IrmnQ2yJprtVkkhtIWO8bAmI9RLnKO9io62101iXo7BkKYRWmbBi7i5TmpmYawxKieezKyzz4IbGv1W9z4FQ9kZZVatUqzUFT9WnHJqYWNVrVcBP2UpGiR4CwENmZdxbzbTSHHXlGyGkJzKUelhcxpuBODtaqykLral01iySZZFlvqHRVtGx5i45wLOVdXd92Q1UY+LH4Fr+5RaDRajWZ9NPpUm5NzBAJSkaN+KjskfGPQvCrhXKUNLVVqriZidNil+wytaeq0Dpm/LPLa0WnD2H8N4Qp6JaUk2UJtdLSSlWc9VKVq4roTtytC0/WHp1VlKKGzslJ36Xirys1yK/K5Omn9T7/L/ckqhVG0seh09AQ0PrDn4+N4i2WXJhxLaAVLV0GgjtOln5x0NNpKlcyk6J9sPq3WaXhGlvTM3NNMhtP0swvVKT0A3Kj0G0Vsa5WvbA6qrc+Xq29onZ6YkcMU5ybmphjtkNlbjjhAS2kczbkNupMeY+J+PpnFk6uXl3HWqUleZIV68yvYLWBy6A7bQpxMxxO4vn3G8zzFLSslqXcPecNrBxw8z0TsnYRSnE2uoFIIB+sABbXW/wB0XeLhdK6pF1VXGHZLt7IC3SdL35aaCNP4Av0JE1PMPL7LEDotKqdICFNWuUoPJRO/WMzfk3pctB1l1sOoStoOJKSpKtlDqDuI5LrLbqFoK0OoUFIUg5VJUNteRvqCIJyKPWg4xY66pWVuHzPU6EqCiXDc20PWJGkVJUm4ebZ0Wk84zjhhjtGIGxRqw8gVlCbsPrISmcT49FDn1i6K3vcnxIsYyVtU6J6Zi7qruOu2hXiJhSlYwoKgod0ErYfQPpJNw7lPVBPrJ2jyviikT9BrD9HqyEtTLXeCgQUuIOziTzSRr11j1dS59ci/mBu0sWcRbeIjihgan4uoaXmFpl5hu65OZto0o6lC+qFH3GLPBzehml43k429/wB/oeRplpWQ3SAffETOIIHqiLhXaZN02bmKdPyzktOS6i260vdJBtcHmPHnFenmQCrnrrGjhJTSlE12Ndsrr6TmtaEdekP5pCRcgG0NdPGHFxCzsSEmgEpAHKLRhWkzVZq8rSpJAU9MrCEi2w5qv0GsVyR5RvXya6JKzHp1Xcca7dCwwgEjO0nQlVvHa8GVpPRneayvy1ErEvBoL6ZTCmFZal08ZFlnI0QLKy/XcJ+0o6jwMUSZcLq790a6a84lcVVCZmam884hTarkdmdOztoB7ojKW/KoqLAmgtbGcZzz6D4xb119MdnmVKlJSul3bJ2RVLYcw9M12oJAOQfRE2UvN6jaT1UdSeQjC8T1ebqtUmanUHC4/MLzqUonbklI6AaAcgI1vjlIVE0ynTvaJdpbOdLiEbIdULhRPMKFgOm0YtUUqSFAXO4OsAZM23/I1nA0QVfq+ZS8kPPOK1zk5ufnEatSTe99YeTYOa1reEMigm9wRAEjZ0pJBU35DSHUu1e1xBW2u8BElKMJOp0AFyfLlHUhW2aR1hjuggQ8SjKoE7jnaN+4GcN5JNAVWq/Iy0w5Ot3ZbmWUrSy0PrEKBGZW48I0BWFMDn1qbRk/+Xt/qEP6TJ5fP1VWOGtnkYBPSAQCACLgbXj1qcJ4Dv8AvOifmSP2QPwUwJ/idC/MW/2Qulg3+P1/+r/dHktaAoG+t94Qclx0j17+CeBSNZWgD/wLUd/BPAhFjKUH8wa/ZDHtDo8/X8mePfR09PhHBLpvsPdHsZOEcBf4pQvzBr9kGGEMAX/eVB/MGv2RG5NE652v5fc8eIlxbQQu3L+Eev04RwB/idC/MWv9mFW8KYCB0laCfKRYP3piN269jn+MQf8A2ePuxAJNx01/3QvLSb8y8GpSXffcUbBDTSlE+QGsew5eiYGlVhbTFMQsc25KXFv/AERIqn6A212aFTDiBplSSEn2DT3RDLIfyGz5WtLba/c8s0ThzjKdCVGiuSjSjYLnHEsEeORXfV7BGk4W4GLc7N2sVF161iWZdHZIPmtfet5I9saia5Ly5Umn0xpsH65sPfbWGMzWag+Mqny2g/VbGnv3ged02ipyOfrXv+w5oWE8LYTaUiWaYlnFjvhk/SL8FLN1qHtt4QtOVchvsJJpEuyDoUDX3RDF0kgqWbnqLkxK02kTc4oLQ0UII/dHEnaAJ9U2VcuQyM2XRTHSI9a1OKJUVlSjrm1JiWpdIdeT6RMqMvL7m+hWP1Q7cTR6FLOTUy626psEuOrIyItve+0YzxF41KeU5JYZSiaN+7POp+hR1Dbf1z0UqGwxXJ/MOweEfV12vcv+eTScd4+oeDaSlBXZbqPxaXav2sx4i3qjxMeccX4tq2Kagibqb/caJ9HlW9G2Ndx1V1VuecVucmpucnHZ2fm3pqaeN3HXVlS1eZMFQQbJBOumUDUnoItcfFjUuqRpY09C0OyM2tk3Isbcuet9hbe28aJwm4eu4jebqtVbPzQk3ZaN0mcynU33S2OZ3O20P+FHDB+qrYqWIZVbcuqzjEgokF0fxjp+okck/W5x6LpLMlIoMsyEKdCO8UgACwsAByA2A5CB8rM38MBjfV8Kf9Tyt8oCzXEiZbFgESUulICQkABI2A0A8BGdduEmwFtYv3ygyRxGdIIsqRlz8DGYOOEGDcTvUgvGr3BEk1MLDiXm1KS40cyXEKKSnlvyItcR6A4X43axZIinz60t15lGZRuAJtI/hE8s3VPM6x5xadzEXOo1HntErTJp6XmGnmH1sPtLDjbyDZbauRFvdEGZhRyI/Uiz8KF9fRJHq3IEkhVwobG/KJGjT4lF9k5bsXNCk+POKRw6xgziykKS8W2qxJoBmWrZQ4Nu0SPsnYpHqmLGvMLpsQRob7+2MrOuVE9MwlldvHX9iB418P04kkEz9KSj50YT+LLP/SUW/cVHqANCdto8tziVBJSttSLkpKVDKc17kEciNo9pUabT+8JsZm3PUv8AVPKMb+UPgRUu7MYtpzKUqBHzohCLZwdBMJGx6K6m5MXfH5evhfg2fEcjG5JHnucaUBbL8IZdmr7PwiYn2yhACbBPIXvp5wyseoi/Xc2FM9xCySiNYvHDzE05hmuM1OUUFpsEvNk911PMHqR+qM9k3FXsFbjQXiYkniCCSbm3OCa5AufjqyLjLueo6wzI4oo7WIKKsuhbeZQv3nAN7/yiTp4xSF3bdVcm/O4tf2RWuFmNnMMVRLU2pZpL7gD6QdWjycR0textvGn4uozTrAq8gW+yWEqXkHcsrZafyTzHKLbHu6lo82y8OWBd0P8AQ/D/APh3ClVlZ6UVQKqhD8q8nswhZ9YW/cyeXVJ5GMb4mYRmsK1jse+7T3u9KTBHdWkbpPRSdrc4ujZUk2F021ABvzuPjFxkPQMZYedw/XBmXlu04PXSQPXSeahsYZlUKS6o+SfBy3gW78wfn6fU8xzCCok8/KGymldTF0xjhSfwzV3adOtpLie+y4E91xB2UORBGtorjzAHqXtyvvFU4s3NOVGcdxe0NGEbd2/ti+8IsJLxTiVtt4LTT5Qpdm1jkL2CR4kxSkN2Ium19LnT7/PePVPC6Rw7grD0rIzFVpPpyk9tO5Zxq6nSLhF82oTsPGORXfTK/mcudGO3BfE+xbKzM+g01uSaSlDzlipLegQANALchsPKKo466Sd7xPzVewnMPl1yoU9ajur5za1/9yEhV8GX/fdNH/mjX95BcZRSPLLcXIss6mn+zIQOTHVXvgilP/le+LD87YKH/S6aT/8A6rX95Bk1PBbhAExIq8qk1+pyOOxMesK5e32ZV3XHgdc20IGZWkd4k36xfUU6hT8uHZdLyW/41h5LqR52UYjZ7CC3Wi9IPonBe+Ud1QHlEMpJhEaJx/UiqJniNM5hdmcJ03vCM3TXmHVJKFJULhSSNU2hOWGVQz3uR7tYhlFaE4RkiXadWQLKMK9ovKO+qLVhMUWrMFL8i2ibaFyhBtmHIiBPT+FJBxKJ5qWlVqBKQ++2jNbe2ZYgOb76Hf4Y5pSUvJWkO3P7rY9LwqhRcNgVE36xKv4vwNKJK1z1FSkcxMtuH3IKojJ3i9gWTZPYVNpxY0CGJR1ZP9ZKR8YicfoSQ4Syx63v+hISdLqEwQWZVwg7KV3R7OsSrGGnbdrPTbbCR6wAH3xmFY4+yrXdp1Kn5q/8YtuXHsAzKIiiVzjJi6ecUZN2XpQNwC212rpHTO4VKB8gPIQz0W32Rc4v4dgtOUf3PRk3NYcw9JGoPLZS0k2MzMuBLYPmoi/9EHyjMMa8eJJpC5agsGpKI7roKmpds+0Bbnwv0jA6tV5upzipupTkzOTKvWdmHCtZ9piNdfzLNjyiSOLp9zQ43GQrXddvoWrFOMK1iZ8PVqecfCdUMpbKGWumVGiR5nXqYhDNFarqNid7GIgqI5je4hRpxRIJJOsFRhGC0ix/Lxiuxa8N0Sp4iqKafRpFydmSMygkkBA6qNtAPjG+cMuEEnRy3UKo43PVEG/bLRZlg80tpPrqv9Y7copHyVlBdbrja+8ktS2YHUEdqBb3aRvGJZ5ztHJdCwltIFkAbiKrNvl4KTkMtYyal4/uCcq0vKoVK07vKV3lvXuVnqTzPjBsNuZ51xSiVEtkkk3J2iuOOhS9M29xrE3hU/ji+nZH7xFPGUpz2zMY+fZkZUd+DzX8oBQ/D8H/ALvlx8DGYuE9RGn/ACgU/wDP0af9Xsf/ACjL3xvGlw/8pHoGDr0ogbXlVvD2WcKlAX0iPAvbX4Q9lEg2FhBYRdFaLLh6qz9FqstVJBzLOMLCkDLcKCjlykcwdrR6bKVhJ7RpLKhlGRK8wQu3fTf6wBuAYwPg1RzVMYMzjzZXJ0gelOg6hTmgaT7VkE+AMbu8o9tkWoqCNM17knmffGZ5aSdmkYj8R2wXTD3F2gpxxCW03USLJtzhjxnrLdFwfUJkLCn2ZQSjIVst1+6LHrZN1+wGJnDyO0nlPuK7jALiz48oxP5ReIDPVqRoQJ/FUmcnEg/wjoIbSRt3W8v9Y9YhwaXKaFwNDen8+/7GJTqcraUg3AFhpDG3/Fok6gsEA35cjEb2g6xrYx0j0WhfCQ0u4Qq40iUknzt0iDZWQYfSzttbxyD0ywvq2iyybtrEG1/1xrXB3Gzcg43h+rOj0B45Jd1feEuo6lChzQo622B1jFZN8kjXlExKzA0SowZCentGZ5HChfB1zR6Axfh30B0zEqm0so6a3yE/VUenQxX5R5yXeS4lRbUlQIVsQRC/CfHDE3Lt4XrzoUlSezlX3DcLT/FKJ2t9U8uUSOLqGunOF5Fyws2Qo6i/2T4iLai5TjowNtVmLb6F3j2ZNT0rSsf4c+bajkanWrqaeT6za7esn8kn1k9Y8/4pok/QKu7TKk2UPtnMFAXSsclA80kaxp8jOzEnMIeadLTiD3V9OoI8Yt9QplH4gYa7Orp9FU1fs5uwvLqAuojqnqOsC5OOu8oh/HZ8sGxVy7wb7fQ80pRdWguLW8xCjaADokDyHTaFFlPaKCVhaQo2WBbMOsGQnvK1+EAKCNhKW0HQqyRdXwhRa9DlAJh5S6PVaolZptMnp0NEZ/R2CtIO9iQOnKHgwnikaHDVWB5/ijn+zDgWcq09NohrmDC9xEv+CmKL/wD27V/zNf8AswqjCmJwAThysfma/wDZji0Ru6r2aGNOffk30vyz7jDqTdK21FKgfAiNKwXxXq9KmGkVsmqywITn9WZQOoV/CW5hWsUgYYxKP+z1W/M3P9mOjD2JE6HD9X/M1xySiwW1U2/q0z04h2k4wozU/T5hp11YIZctlzqG6VjkR0MUafl1MTKmiFJUlRSQRqlQ6iKVwqnsRYXxAlMzSKomlzakomkKlF9w7IWNNLHfwjY8b00TDLNUQkJcJDT4GneB0PnEP0M1yGKq57iysUSovys6080pRWggpJNgfA+FonuKmH2sWYPXNSbYXNtt+lSZy3IWnVbfhmHLmRFZaQG1C+mu0X7Bc0X6VMSiSc7R7VsqNteY/wCOsDWw9yDBucLNb+v9TyqFBKcyBYEW8oaTK8ylHe0XXHuE6pJYzqkrSKTOzMkp4PMmXllKQlLic2QWSfVvb2RXzhbFChrhqspB/wD0HD/8YmhZBrua6ucddSZXJg90kC14YurKQOVhp4Ra3cJ4mN0/g5WT/wCAd/ZDJ7B2KVKyowxWlFXdAMg6T12CYUpwfhlhVdB9tlUdcNtdoRLhveHM4w6y8608w4y42ooW2tJCkKBsQQdQRDbLlSLpBsNb7HXr8IZ9WWcOnR25UD3b+2HEvoqx+rFsxRgxWHeHeHKzONlNRrD77ikqUQWmEto7MFPU3zX31iqM2zabGEpbOOSlHaZuPyVwBXK317KV/thGy4kWRUnQncEe6Mb+St/9brf+blv7YRrmKl5arMW0NkxU5UNyMF+JH5/oR3b94ARZMJrCp1X+aP3iKclwBzSLVg8hU8r/ADR+8QH6OmZ/A3G+J56+UEP+fabf5Pl/vVGYPIveNR4+646F9f8ABzH64zhbepNovcSP8NHpWHLVcRo02Rz+EO2E5U5yDa4uRCjDRJHSL7wjwomuYjTOTjHaU6mkOvoI0dcOrbY69TEl9npwciXJyYVwcpexpvCygnDmDWvSEWn5y0zNcjdSfokf0Qb25EmLKk2KtLkaed45MLU46StWdYUSpQ5nmfbD2iSwmZ1CVCzKO+s9AIyk92z2zzPJtnnZW/m/sOKjMStDwwuZqKw20GjMzKhuEJurL5myEjxJjyNiKqzNXqc5V50kzE48Xl3N8tzokeAFgByAEbN8ozFGZhjD0u4fxwdvOIvqhlCvo0HpmICreUYJUXFAb7b6xecfRpdTN/xON0QQwnnL3B0ERuZPWF51fU3hndPQRaGtpr1EiArUAGHLLmtt7ctoZqB5C0KoXoL72iFMspx2Sss/lO1vDpElLTINrxAMOG+4h206UqETQkAX4/UWViaUDYKtqDv02ja+GXECVrEunD+I3UKmFIyNPrVpMDYIWo6hfRXOPPLEx3jqTDtuYUFJWlZGXUEGCK7nF7Rn+Q4mvJh0S/f5Ho2uYbmZKfSmVu4y45lbIGo8CIZcXKy3h3CLOHpN6z86js1KSbKQ0D3yf56tvDSK/wAM+KrDTSKViyYcSykAMzyUFa02GiVj63QE7RQccYiOI8UTlTF0MFYRLo1HZsoNkDzta/jBVuSp1pLz7mcwOFyIZP8AH7xj4+oyQQct9NNofU6XdnJpqWl0KcdeWG20gnVR0HuiJZc0ubGNu+TrhNx5/wDCmaaKQm7cjcaX+u5bw2HjAyfsXXIXxxaXZL2/uajgqgSeEMHIkniFkDPMrSf3Z7nbwTqPZCiq5TxvTXP9ZBsTonpl1MvLyb5ZZ2KUaKMQKqLVFbyUyfJowRCEdd2eV5GVbfY5Ex8+0u+tJJ/0wjv4QUrb5o/94RB/MFU5SU5/qT+2OpoFU/xKa/1Jh3p1/MSstX/RO/hFSv8AJP8A7wg/4Q0uwtSVH/SRAjD9Uv8AvOa/1Sv2x38Hqn/iM1/qD+2GOuA5XXfL7FgTiSmAWFKUOozwWfxHITNIfkUSDjYcF/XuEq5HwiAVh+qjT0GY1/kT+2EnaJU2G1uOSL6UJF1KLagAAkknURDKEN+SeFt3dNDZ1xOcaJ9g0iawxVEU6cD6mytKkFKgFgRWHFq7Qg3uDzh/TEPTDoZZQ444QcoQkqO0QWQTJFuGpR8l1RW6Se6Kcoa3H0w398Lt1Wmq0FPUP6UQLFHqea5k5m38wiHrdInzqZd8Hp2cCSgiKWVlJ/DH7Fhps1IzcyhlMkq6uZO0VjjPi1nCGH1/N2RFTmyZeTSQLZiO8s35AaecT0ohFEpjk3OOIZeUgqu5p2aQNT7Br4k2jytxExSvF2KZmpELRKfuUmg8mgdyOqtz1MMhXuRqeIpsugnavBWn2g4SsqW4pRzFa9VKJ5nxi6cF8CfhZitC51oqpcjZyaVbRxR1QgfC4iuScu9OzTUswjtZmYcDbaea1KNvhHrXhjhuUwbhaVp5Qkv5h26h/CPKOpvzA5HpBNq7aLzJy3TDpT7syr5XKFfNWHgoWPpMzccr9m3ePP7aSV3JuTHo35XCAuWoQsCPSpj+yRHnsNd7SI61vuTcfLpx4x38zZ/ksDLVq2f5KW/tTGo4sdtVpgeKfujMPkujLVq3f+Klv7Uxo+MllNYmdNiP0UwLbHbZlPxC92a/kQzbh7Uaxb8GLvPH/NH7xFFad+m9sXDBbhM8dh9Cf0hA84FHX8FsWYfx3GbHX/l7H64z8t6mNF43gHHV9D+IMD4qiiLTYWNkhIJJJ8LxY42o17N/iz1VH+QrSZGYnp1iRkmS9NzCuzZbGtyeZ8tT5R6Mw7R5fDGH5ekyRDqmwVKcToXnDqpavM3Sn8kCKnwjwp8ySP4Q1NsJnZpCSwkiypdo7/0li3iBpFvW4t1ZCxreyQBonrYcorcy2Vr6UZrnOR65ehB9vcdM953urSsXte3rGJarzUnhvCsxN1BXZtpaL0wobhI2HmdBbzgtAlGjnnZjVlnW9iSpR5WHw98Y9x9xeqqVz8HZVeZiRcC50A2Dj+wRfmED4xBj4/VJIZw2D1Prfv8A2M2xPVputVicrE8PxqedzqClGydLIQn8lKbD2RUqg6lXqm4PO1rxJ1F8BOhtzivTz+hMaCMFCOkeh4VT13Q0m3e9a0NO18INMOEi8Nu08IRfVw0hqM175TbbeODMknnBjvblHF6KvEAboUQoWuLXhZp0j1iYaXscyQPGOhy+8d2RygSSHdLjrDlp8WiKDhCBl25iFWnTY6Q9TB7KUyXS8cgKbW5gwsHQbd3cdYh23T4w4be01FzeJFIEnR2J2TdZDqO2QpSMwKwFBJKb6gftjdqZxwotOkpeRp2F5uXlJZoNS6fS0JISOv0Z1O58Y87Mu6jXpDxpZNrdYlUmUufxtOTHptW0eiUce5cjSgzwHT01v+7hVHHpj/IU7+et/wB3Hn1k7X6mF0r/ACvhD1v3ZTS4LDj4iegBx7Y/yDOfnzf93HRx8Y//AB+a/P0f3cYEFm4GYe6FmweajC6fqMfD4y/0m8p48tq2w7N/nyf7uDp47JOgw/Ofnzf93GGMwukEKuBtqelo70fUifG4y/0m4o43lagBh+cJJAH48jflYdnrvaNKqs5ON4XnHJwFDrrYb7IqCghah3kXFs1rkX52jF+BuDZmdqbOJJ+VWqRlnB6I2vu9u6PreAT15xouOKq2t9FPl1BwSw7yraKcO5++I1HcuxScl6ND1X5Ks619JZJvrFt4dSp+cHppQsiWZJueajFblEJcXp6pNj4Afri8LmJfC+BpmpTqQmzKph+4tYBN0o9pyj2mHWvpRXYtbssSRTcV8ZWsP4inKOaZMzpllpSXkTSEjMU3UmxSdjpEWr5QDYUbYbnd/wDH2/7uMQqk69OTz89NKu++6p9w/lKNz98MQvWB/R35Zs6+NpUVtGqcReLE7iyiqpMrTXKYxMECbcVNJfW6gbJACRlF97bxmwbAN9iOm1vCCyyHZl9uWl0OPOrIShptJUtV+gAJMa9w34SVGZmGZ3FbJl5dNnEU4Edqvn3yPUA+ydesdUVHwS2zqxK970vuPPk94IeQ6MWVFstkhSKeFfUGxdI+7zjTpmriaxBKSrBsw2+2lIB31IhDE1dlKZKppVMDSVhAQpTYASykaBIA0tyAGgiCwwoLq8kofx6P0jDlXtdzF8jnTyLk142QXyrlfi1CT0mpj+ybjA7AqveN3+VgPoaHbT8amP7NqMFRfS8Mqj5Nnx/+RE2j5MKf8KVw/wAlLf2pi+Y2Ufnqa1+sP0ERQ/kyG1Trv+al/wC0MXTGzn+HJsWN+0A0P5KYgce7M3zXe9L+RAtq7981j5Rb8FOfjqU9W1XMUhpw9oBe+sXLBik/OKAP4tUQzgVN0elpmS8aEA42UTsJNj3DND3hTgpNQcRXawxnkwomUYWLB5Sd1qv9QdDvFqrWDxX8dqqNQB+bWJdpPZJNlTKxc5QeSB9Y9dInqjNthAkpZKCyEBHcGVJSNAlI5JHSI5W6h0RLTJ5ZVY8a6n8TX7B6hO9qspDhWm9783FcyYVpUm7NzaGGhlUfW5hKecR8q046+lCLuOKOmUaa84sFZqVNwThaYqE+8E5EDtCn13VnQNIHXl5axAq23tlLh40smzuQnFvGLWEKE1JUx1Pzg7dEmm98oA77yh4DQeOseZJp7I0QMxvcm6tydzEpiyvT1drUxVZ9YVNukBLYIs2hPqoSPsgc+doq07MDUXuDtFlj0qC2z0rj8JVxURGemL3KjreIaZduT0headumwtEdML03iZs0+NVpCbqzaEMx6QHVnLuYRznqYbssUhS4OloKoHwgRw63iInCqvpYW8oFhvYQYAhOp+EJkqvDRBsyk8oOlZOtzrCZvsTuICNhHdjGh0lzYX1hdpf1TDJJ1hw2b2vrDkyCSJOVII62iRlk3Te+xiOldLWiYpqAZhoHYuJuPaIIiyoypJDlhFxC6W/OPWNSwjgyXmHlu0GjSyC4pCUmVSAfKw0huMOYAB0p9G/NoKVb9jBW/iinqcVF9jy423rewhUIAItcnmMpj1G3QcBN6iQog8TJJV94hzKjBtPcDkoZCXWOctT0IV7CER1wkRv8S1tfpf2POOHcL4gri7UukTEwnm6oFCE+ZNhGtYB4TS6FtTeIXEzjiNTKMkBlJ/KXuryGkXaexPTm7KYln5tY2U6qw90V6r4pqc6nsw6mXYIt2TZsLeJ3PkNIcqZMrcjnbLvhgtL7lqr9blaZK/N1NS1nQ32V0AJS0kaZEgbAdIz5YdfduMxzbGCN5lKy6lIO9ha/lvFuwxh5Uy2mZnCZeV3Kr6rvtl6RJ0xqj38lU5TsmGwVSkvrVOzoAk2DdRI0cV9kdQNyeukZ/wDKPxwJqaThKTd7rSg9USFaZgboaNtDbmNri8Wni/xHl8KyQpFGyGrlsejspsfRUkaOLGxUR6o9p1jy5NzC1uuOuOKdccUVrWo3KieZ8YAnLqkbDg+MaXqT/p/uOpl8rUTvfxgiF3IERva3VrDiXcuqOp7NO6Wka58m9akY/dUlRT/g961jtqmNnxrW5qQdcp8otEs0Ei6kJ1Nxt4Ri/wAm8g49Xcf9Xv8A/wAY1TiMctafP5KPuiWqCbMJz6f5lL6Iqbs2VO3USSTc3NzFhwc9mq8kP5dv9IxTlr+kGvOLTgwj55kQP49v9IRLOPYrbqVGKaGXyqO9L0P/APrmP7NqMKCU31Avy1jdflR6s0QHb0qY1/0bUYcjNbnrAla8mw42f/jRNb+TRcVKv7fuUv8ApmLVjZw/Pk8dh2h+6Kp8nG6ajXtSPoZb9OLNjg5q1PD+VIHvhqjtlDyvfL/YgkOAKAGmsWjCM40xU2lPOJQhSVgrJsE93S8U9Su9eHcm6sEpBOvjvEUq9gmRV1IuE9VEuNKalxmQoDOvYrHQdAIaMNqfcOhOc6JSSQonod4ZSLK3lAJzKKtLAXKjeL1T5OUoEg7VKo8y0tpHaKLirJZRbc/dYa3iB1RiA04rsl0xBLNSmGqU7Uqm+2wUNlbrjnqspH6ztYc484cTsaTGL636QoOy9NlypMpLKPfsfWcWNsyhb7tokeK2PZjGE76NLFxqisqu22rRT6tu0X+octhGbTr6Cm4Oh1ESVU99s3XFcZGhJ67ic9NaZVaaaiIaaeFz47QpOTCQCSrfTaIt90qSQSNOcTmtxqNBHlm51EM3V9YM6q/PlDYk3EMZbQhpAJBUYLcdBBwBfaDZU9B7oaSoKoQXaDwQ7wwkO3O1zBFCDQIaIKbEDe9o6gWGsCBeEIOm3SHDOwhqkkHwMO5f1bb3h6IJ+CRk7G1uvOJ6mAdu1oL9on7xEBKHQA66ROU5xKXEqOtlA6A6AEXOnS0Tx8FHmrsz1/xHcLbDZBP77c+6M4dqbiFAXjTaoJPFdL7enTCXkuLMxKOJ1SsEXsRyNuR2jLKpT32n1tONKaWklJBGqSDzvF1iuLWjxyuqCtlCxd9khJTrzvqqA63Va3tMPmy873isnrr/ALor9MmFMTKVhagpFlA21GuhAjZsJ4jTUpYSzxSidCSUqKAO2A3NuRvyh2ROVfdLsctx49Wt6KNLUubm9GWXV/zUGJaRwZPOkLfyy6SNVLOvuhxj3HVQwiG1v0d6bYdVlS8h9KEJVzSo5SQYzGt8XMTzSl+golKYFHfIX3ADt690+0AeQgJ5E5PsE4vEWXpST7M15FPoOHJH5ynnmlhkkKmH1BLST4AnU+AufCMr4lcZFuFySwuVOHb09aLJH+bQdQfylDyAjM69VqhVpkzNUnpmcet6zzhXl8B0HgNIr80c3vvEE+p+TUcdwtVUtz7v7CVQnH5mZdmJh5x951ZWtxxRUpaj9Yk6k+MRriwo2EOXgomwENS2re2sQe5q6oxihMA3h1LEgi0FQ1oNIcsNHMNIekdsmtGqfJxXl4gOE7egPD9GNS4lO2rkyLaJS390ZX8ntOXHaz/3e/77CNJ4nOlGJJtJ1BS1+jBWP+owHOfFmr+SKcVHtd+cW3BWtVklX/h2/wBIRSw4C4NYtODZhKKpJXO0w2T/AFxE1i8g+ZX/AA0H+U4graonP8bmP7NqMVCAm9zYAam2gHXWPQHGihVHE8xTpSmlgKl5h4vLdcCQgKbQAbak7RHUXhrh2iMIqGIJhFRc3SqYBbYQd7IbHeXr10PSAY72+wficjRRjRUpd/kvJC/J/lpltdZnlMuCXfQy00vLlC1BfLyiUxbM9pXp0JOgmHBe/wCUYmKtidTaEM0trsuzTkD7iO8lI5IQO62PuipFBddKgVG5uSTe8PhW0Vs7nk3u6S0giE5zoDz++JqkU12YfQhpClqUbBIEKYdoU7UnwmWbOQHvrI7qfbFqrtboHD2jh6Zd7accFmkosp15XMIHJPiYbPURNSyJqutbJCUYpmEaS7VKtNNMKaQS64s3SzztbfMdtN+cYFxPx/O4tnVMNh2VpDLl2pdaxmWf4xw81fk7DYRG48xlVMVz4mKitTcshRMvKNq7rXhrqtZ5q3imT00SO+b5enKIFXvvI0/G8VGnTfkNNzQKLqBvbS8RE3NZiSeesCamMwKjc31FzEXMOlWtwBDpSNXjY+gTD2ZW+ltoZPuAC25gPOXGkN1nvC4XfqBEbZbV16OKUo6C0FST0jp9aOjQEwwnSBHYECEPCwVQPSDQBcg3hgguVXSOR3+kffHIQ4EEO8GO8cUDdWnKGiOi4INj4i8OWiAuw2tDUAddYUbUqwItppDyKS7ErKrtqYlpVWcju3HnEEwvb4xJSjhAFiImg+5V5Ne0avwmxxM4UnRLv55mkuqHbMZ7lon66Oh623j0DVadIYnprNTp7zL63G8zTo0TMJtsei/A7R5AkngMoJ5xo/C/H8zhad9GfUt6kvqu419ZtV7do34jmOcGQn090YPmuH9d+pD9S+5b6tIOyq1IKFN5CUqFr5DfUGCUmqOy0wnItSVp1SpCrFKhsfONJrVOlMT09FRp7jLjqmwtt5uxQ+m1x7bddozKoyT7TxQoLQUEpIUPVIHOLKFitjpmTqn17rsWmjUqdNyGMaO/TKmhpUwtvK83YEPC2ixyv90YLxEwZPYTqSQUOOU58kyrx5G+rauihtfnFuodTclXG3A6pBRqlSSQU67eUacxMUzGlCep080h11aLPsEAdp0WnxEA3UuD2gzCzJ4c9PvH/nc8pTSFIvbQ9OkMXEk6mLxxEwdOYTqZaeu9IOn6CZsdU/ZPRXjFNdRpqdCLadYgctm1x7Yzgpxe9jRTd76jYQT0c30IMarwflsCVloUDElDZFWuoys76U6hMwCblKwFAAjYHnGjzXDTAMtZ1+jhpo6gibeP64UYOQNnc5Tgz6Ld/seZ0ytiCTzh6zLCwsB749BfgfwrZ1ck2leCpl8/cYMik8LJQ5madKKWNgUTDnwUuxiZUy+RXy/ElE18Kb/oUDgW32WNlL5CReBsNouvFNxX4WTaSdcrX6AiSbrWF6YlaqZRUoURlUtiWbZJHTMAVWPOKri+pqrVYfnwyGlO5bNhWa2VIA1+MTV0yiyntveZkqzWlohCe8DYaRI0mdLDzbmxSoKBHgb28Ij8qleqDaFpdpwiwT74mcd+Q27ocNNl/nMaPTDzi5OUbk1uHvrI7Vd7a25ARAvz8zNul11xbjq91KOYn2w0ptPm5p9KGGluuXslLaL/AB5ReKJg1aVIVVZlEqCL9ilQUtXmdkxC1CBSuNdcv4a2ysSci++6kdisuL0CQLkxcaNg5DYE1WFpabQMxZC9bW+sdAmGNf4hYOwa0uUpiBOVBNwphhQWq/5bmuXy5RjWN+IFdxOFtTj6ZaRUSUSbCyEHT6x9Zw+enQCBna5dolli8XfkNSmtI0rHXFanUeVcpOE0MzDyO5238AwRof8AOHx2jDK1VJyozz9QqUy5NzL2qnHDv4Ach0A0HKGs1NDNocoGg12iIm5kG9jeImku7NdgcbXStQQ5mZvnz2vEXMzNhoABCExMqKcqcxO5hi4+bknXziNs0FGMkKTDxJ12hm85fTlHHHVqAy2tCC135GI2yyrr0GUTtsITItsQY7qRqT744E21hjJ0jo22jsCOQh5y5gXMCBHBAgHeBAuekcECw6CC2tHbmOXPSOCOKgJgxTqIKRYmGjgHwSN94CSAq3KAEqA3No4Rc6Q4Yx00ojyh2w6AYjEOKBIBOnWHTSxfW0OTILK00TcrMaCJSWeuACdDyitsOqB8IkJV9VwL6fdBCmVORj7Nf4U8QHMMzSJKol1+kuqzKF7qYWdlo8Oo5xuGI6RLVySbqMgtpyYW2HUqT6kwi2ik+No8iyjxvovQ2J841HhBxDdw1MJpdTcdcpDqrpWnVUos7KT+QeYieq1wezEc1wvq/wAWntJfcnp6VcZeJUlVwSFA6lPnDmjVJ+UmEOIdUlxtVwoaEHrGhYkoTFZlhUJAtqfU1nIbIKH0EaLSdiOfWM6mJFxpRWEqAPXS3nFnGcbUZWNnUuifZmmBNNxtQ3pGosoU+U5XmL76aLSeSuYI1tpHnzHuDJ7CtWMu7Z6WeuZSYtZK9fVV9lQHLrGlUKqPSswy4h0pdQe4rnbmDF/mWaXjSgPSU8wVhSPpmRbMDycQeREA3VuD2g3j8+eLPpfeJ5WS0lJ0uAFDKDoscwoW5iNu4Y47RWWE4fr6i5OqGRt1Z1mdOp2cH/q3OsZ3jbCs7haqehzOZ+WdJVKzCBZLyefkocwYgLbm5BFgCO6Dz0PIiGJp90aHKprzqtS7r2NtxZRnpEl5pXbSix9E6kaDwMVVSX9UgEDpeJnAHEanv01ym4wmENqSj92dSpaZm3XKDZfU7kxKuY84WSmYsqYmVcsks65f+ukCCo5SS7mZhgZVM3BQ2U8SrijdXd8/90SchhqozoSZaTmXAqxBCSke8gX87w8e4zYZkQr5rpMysjkiWblx78yvuiFqfHapvIy06issdVTE0XD7kBA98ceW/ZBdfH51i7R0W2RwBPZQqdXLySf5RzMv2AaRKO4ewvQJYTVbnUuC10qfdSy2vnoBqYxGscUMYzyVoNbVKtqNwJRtDKteWdPeI8yfMxU5uedmZhb0w44+8o5lLdXmUo9STuYjds5h1XA2y/zJ/sbvW+MGHqO2qWw3JGcSNAWkhhgG3NZGZXuHnGV4qx/iTEDamp2odhJHUy0rdDZvyWb3X7SYp7813tTr5wzemTe+bXrEMvqXuJw9NH6Y9/mSbkzkTlSbJ6Xhm/O94aA3vfXeI1+aNtVQxfmdYY56LyrDJGZm9CdCYjn3yVd22sNHXjfcwi47zvEMp7LKrHSFHXTrpYneG63BBVOmxN7+cJg31MR7DIQSOrXc2SPb0ga8zrBVE5rWsINDSVILfW1zaDe28csOkdhDjkcuYBgaxwQLnpAuekCBHBAgQIEIQIECBHBHLEG9zAjsA7bQhHFbQUkW03g+4guSOeBHCQCeZg6FXSSdCOQgihaCjTbSHHGPWV8zeHbLtiLaRGoWCQL6w4QrKRDkweyG0Tko+dLKIHnEvJvXVrfw1isy7wSqJKTf2NxvE0GVGTj7RtvB/iCcPLao9WecVSHFWad9ZUmoncDmgnce2NixHRGakyZ+T7IurbzrShV0OpI0Wg7GPJUi+LRrHCLiMuiONUSrvKVSlEhl7UqlFHl4oJ1tsInhY63tGG5jh+tu2tfF/f8A/ScnJZTSysX1NzfQxIUGpuysy28y6pDiNlgXt4K8DFvxNRG51tU5JJQt6wW4hOzgP108iOfjFCdZU2QUagbQb6qsiZNScl0z7NGizktScaUN6TnmAokAvtJPeQq2i0KOx8RrbSPPuMsOT2E616DN3Wy6CqVmUpGV5HlsFDmI06j1V+UebdbUUOoNxzHkfOLjVZClY1w+9Iz0ucqhmWlP7pLucnEePiIrrd1y2iy43kHjz9Oz9LPL7q9Nwb7g62hm8q5vcnTeLLjbC9TwtVfQJ5KnW3AVysw2mwfRfe3JQ5p5RWJgW20HgIdG1TWzZ0dLW0+zGrruU6gknxhs7MWUb8oM+AAbmI6YURsPjHXNlrVTFocGbhJydJJGg0iPdd1tmsQIbKe1IKrm3SGO1h9eMiRcmzbVQPlDZyYhipzLsQSYTU4vqYY57CoY6HK3bqN1eyG63Tm11sISJBOphJarnQn3xG2FQqSFFrUonaE1E5RfeOJFhck++An1dr6w3ZJrRwgXOkdG0AAhR2jo3hDkju+8COHeOK1Ghjmxx2ODYwBtAhCBHbnrHNfCBHBAgQIEIQIECBCECBAga+EIQIB2gQNfCEIJzjlz1MHKRY6wUDTYxwcA7C+5gEAaWMDQgR3W+vvhCOCxVmAsIVQq5hK1to6Lp5x1EbQ8bXoIeMPZSPOItCri20OGXbbm/mIemDWVplhlZgi3ftEvKzJJAK9LW98VeWc55jrErKP2ygLv4XiVMp8nGTRuXB7iKuk9jQa1M2pxNpOaXqJYk6oV1bJ93KNRxTREPpXUJNA+0+2g3zflJPP2R5Ql3QQReNj4N8RhJBjD9emrSoIRJzizf0f+TXzyHkfq7bQlOVb37GH5rhnLd1S+IllMuNrC0lQ6naJihTj0rMNONKyqGgvsRzEWOv0RDhXNMoyq/hmkgEDxB/ZEC1Khu5CwAT5Q6d8Jx7mLsuku0l3RZa1SKRjOguyM8yQg98pBsthy2jiD98ebcZ4eqGGay5SqiMygMzLwHcfbOyhbY+HLaPQVLmXJRwLaWSU8uShzFoeYuoVJxphtclONkbqadQAp2Vc+0kcwTuOY1iv9X05bRf8ADcuoahPweQ51IynWIebvZQ2sItuPqFU8MVd6lVJlHaoGdpxGqHkk91aDzFtbbxUZtQJOtxBasU1tHpeHqcVJd0R0wq1rE3ho84rS2hh0+oW2EMnCLEEi977QmXVS7BFLtroTBe1WYLdJubD3R0A20hgQkBQURvaAAb78o6IEIdpAG2sdGm0FgQjoDvAgDQ6i/tgG19jHBAgQIEcEA7wIECEIECBAhCBAgQIQgQIB3gQhAgR2OEGFsQLmBAsepjkIQawtHYKIEIQUg3Oo90dULiOwI4IKdEiOb7wcbxwi50hogA3T0g7ayAL7iCWynUwNb5ri0PQ1ofS7p0uYfMPAWy731MRDa77EQ6adNwIlTBbKtosUrMWA1iVlXswCVXI5XO0VaXeykRIMzRzDXnDipvxdm/cKeJ0tTpJNHxPOLbl2EWlJzIp0oSNOyWEgkjoeQ0i//wDKrw+tb8JZY/8AgJj/AGY8ptzmgudocGcJNyu5MQzx+r3M3fwFFk+prueoVcVuH4/7RS/5hMf7MF/5WeHqAbYkl0XFjaQmNf8A0R5dXNXINzCD0yCo2FvIxC8TfuMr/DmNvwz0Jj7FvB3F2H3KVWMTpbIuuUmmqdMZpVzqn6PVJPrCPMVQbSzMutNTSJppCylD6UlIdSDYKANiAd7HXWHUw9oe9a++sR0y4DmJ1PSH047r9zTcdhxxodEN6+o0mSkHmRDR/YEGHDqiVHTTpDV23Z3tziQu617hSAOQgIuOWkFOwgwJvCCAE7xz3wYxy0cEcgQNfCOQhHbDpAgQI4IECBAhCBAgQIQgR0RyACb7QhHTvHIECEICvWgGBAhCO9I7AgRwQIId4ECOiOiBAgQhAgQIENEAbx1PrGBAjggjvrQD6kCBD0JnGIeNesIECHojkO0cvOHbXrDzgQIkBLR4nf2w4G0CBDkAW+Dp9WGznrGBAhCiNJjaGTvre6BAhrCqRF711Q1c/c/bAgREHw8CZ2EGG5gQIRKjpjogQIaITO5gQIEIR0QIECEIECBAhCBAgQIQgR1MCBCEA7xyBAhCP//Z" alt="FinSight" style={{width:40,height:40,objectFit:"contain"}}/>
        </motion.div>
        <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.05em", background: "linear-gradient(135deg,#c7d2fe,#a5b4fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>FinSight</span>
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Link to="/login" style={{ textDecoration: "none" }}>
          <motion.button whileHover={{ color: "white" }}
            style={{ padding: "8px 18px", background: "none", border: "none", color: "rgba(255,255,255,0.45)", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "color 0.2s" }}>
            Sign In
          </motion.button>
        </Link>
        <Link to="/signup" style={{ textDecoration: "none" }}>
          <motion.button whileHover={{ scale: 1.04, boxShadow: "0 8px 28px rgba(99,102,241,0.5)" }} whileTap={{ scale: 0.97 }}
            style={{ padding: "8px 20px", background: "linear-gradient(135deg,#4f46e5,#7c3aed)", color: "white", border: "none", borderRadius: 10, fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 14px rgba(99,102,241,0.35)" }}>
            Get Started
          </motion.button>
        </Link>
      </div>
    </motion.nav>
  );
}

// ── Live animated dashboard mockup ─────────────────────────────────────────────
const MOCK_TRANSACTIONS = [
  { label: "Zomato Order",      cat: "Food",        amt: -349,  color: "#f87171", icon: "🍕" },
  { label: "Salary Credit",     cat: "Income",      amt: 52000, color: "#4ade80", icon: "💼" },
  { label: "Amazon Purchase",   cat: "Shopping",    amt: -1299, color: "#fb923c", icon: "📦" },
  { label: "Netflix Renewal",   cat: "Subscriptions",amt:-649,  color: "#a78bfa", icon: "🎬" },
  { label: "Electricity Bill",  cat: "Utilities",   amt: -870,  color: "#60a5fa", icon: "⚡" },
  { label: "Freelance Payment", cat: "Income",      amt: 8500,  color: "#4ade80", icon: "💻" },
];

const MOCK_BARS = [
  { month: "Aug", spend: 62, save: 38 },
  { month: "Sep", spend: 58, save: 42 },
  { month: "Oct", spend: 71, save: 29 },
  { month: "Nov", spend: 55, save: 45 },
  { month: "Dec", spend: 48, save: 52 },
  { month: "Jan", spend: 44, save: 56 },
];

function DashboardMockup() {
  const [visibleTx, setVisibleTx] = useState(0);
  const [animatedBars, setAnimatedBars] = useState(false);

  useEffect(() => {
    // Stagger in transactions
    const timers = MOCK_TRANSACTIONS.map((_, i) =>
      setTimeout(() => setVisibleTx(i + 1), 600 + i * 320)
    );
    setTimeout(() => setAnimatedBars(true), 400);
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
      style={{
        width: "100%", maxWidth: 860,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 24, overflow: "hidden",
        boxShadow: "0 80px 160px rgba(0,0,0,0.8), 0 0 0 1px rgba(99,102,241,0.08), 0 0 120px rgba(99,102,241,0.08)",
        backdropFilter: "blur(20px)",
        position: "relative",
      }}>
      {/* Top shimmer */}
      <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: "linear-gradient(90deg,transparent,rgba(99,102,241,0.6),rgba(168,85,247,0.6),transparent)" }} />

      {/* Browser chrome */}
      <div style={{ padding: "14px 20px", background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {["#f87171","#fbbf24","#4ade80"].map((c,i) => <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.7 }} />)}
        </div>
        <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 6, height: 24, marginInline: 12, display: "flex", alignItems: "center", paddingInline: 10 }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", fontFamily: "monospace" }}>finsight.app/dashboard</span>
        </div>
      </div>

      {/* Dashboard content */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>

        {/* LEFT: spending chart + summary cards */}
        <div style={{ padding: "24px", borderRight: "1px solid rgba(255,255,255,0.05)" }}>

          {/* Mini summary pills */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
            {[
              { label: "This Month",  val: "₹14,220", sub: "spent", color: "#f87171" },
              { label: "Saved",       val: "₹8,780",  sub: "so far", color: "#4ade80" },
              { label: "Income",      val: "₹60,500", sub: "total",  color: "#818cf8" },
              { label: "Budget Left", val: "61%",      sub: "remaining", color: "#fb923c" },
            ].map((s, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 + i * 0.1, duration: 0.4 }}
                style={{ padding: "12px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12 }}>
                <p style={{ margin: "0 0 4px", fontSize: 9.5, color: "rgba(255,255,255,0.3)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>{s.label}</p>
                <p style={{ margin: 0, fontSize: 17, fontWeight: 900, color: s.color, letterSpacing: "-0.04em" }}>{s.val}</p>
                <p style={{ margin: 0, fontSize: 9.5, color: "rgba(255,255,255,0.25)" }}>{s.sub}</p>
              </motion.div>
            ))}
          </div>

          {/* Bar chart */}
          <div style={{ marginBottom: 8 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 14px" }}>6-Month Spend vs Save</p>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 90 }}>
              {MOCK_BARS.map((b, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, height: "100%", justifyContent: "flex-end" }}>
                  <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 2, justifyContent: "flex-end" }}>
                    <motion.div
                      initial={{ height: 0 }} animate={{ height: animatedBars ? `${b.spend * 0.7}px` : 0 }}
                      transition={{ delay: 0.5 + i * 0.08, duration: 0.6, ease: [0.16,1,0.3,1] }}
                      style={{ background: "rgba(248,113,113,0.5)", borderRadius: "4px 4px 0 0", width: "100%" }} />
                    <motion.div
                      initial={{ height: 0 }} animate={{ height: animatedBars ? `${b.save * 0.7}px` : 0 }}
                      transition={{ delay: 0.6 + i * 0.08, duration: 0.6, ease: [0.16,1,0.3,1] }}
                      style={{ background: "rgba(74,222,128,0.5)", borderRadius: "4px 4px 0 0", width: "100%" }} />
                  </div>
                  <span style={{ fontSize: 8.5, color: "rgba(255,255,255,0.2)", marginTop: 4 }}>{b.month}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
              {[["#f87171","Spending"],["#4ade80","Savings"]].map(([c,l]) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: c, opacity: 0.7 }} />
                  <span style={{ fontSize: 9.5, color: "rgba(255,255,255,0.3)" }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: live transactions feed */}
        <div style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Recent Transactions</p>
            <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.6, repeat: Infinity }}
              style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 5, height: 5, background: "#4ade80", borderRadius: "50%", boxShadow: "0 0 6px #4ade80" }} />
              <span style={{ fontSize: 9.5, color: "#4ade80", fontWeight: 700, letterSpacing: "0.06em" }}>LIVE</span>
            </motion.div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <AnimatePresence>
              {MOCK_TRANSACTIONS.slice(0, visibleTx).map((tx, i) => (
                <motion.div key={tx.label}
                  initial={{ opacity: 0, x: 20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: "auto" }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 12px", borderRadius: 10,
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)",
                    overflow: "hidden",
                  }}>
                  <div style={{ fontSize: 16, flexShrink: 0 }}>{tx.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tx.label}</p>
                    <p style={{ margin: 0, fontSize: 9.5, color: "rgba(255,255,255,0.3)" }}>{tx.cat}</p>
                  </div>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: tx.color, flexShrink: 0, fontFamily: "monospace" }}>
                    {tx.amt > 0 ? "+" : ""}₹{Math.abs(tx.amt).toLocaleString()}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>

            {visibleTx < MOCK_TRANSACTIONS.length && (
              <div style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(255,255,255,0.015)", border: "1px dashed rgba(255,255,255,0.05)" }}>
                <motion.div animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 1.2, repeat: Infinity }}
                  style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: "rgba(255,255,255,0.05)" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.06)", marginBottom: 4, width: "60%" }} />
                    <div style={{ height: 6, borderRadius: 4, background: "rgba(255,255,255,0.04)", width: "35%" }} />
                  </div>
                  <div style={{ height: 8, width: 40, borderRadius: 4, background: "rgba(255,255,255,0.06)" }} />
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom AI bar */}
      <div style={{ padding: "14px 24px", background: "rgba(99,102,241,0.06)", borderTop: "1px solid rgba(99,102,241,0.12)", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
        </div>
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 3, repeat: Infinity }}
          style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.55)", fontStyle: "italic" }}>
          💡 AI Insight: You spent 18% more on food this month. Want me to suggest a budget adjustment?
        </motion.p>
        <motion.div style={{ marginLeft: "auto", flexShrink: 0 }}
          animate={{ opacity: [1, 0] }} transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}>
          <div style={{ width: 2, height: 14, background: "#818cf8", borderRadius: 1 }} />
        </motion.div>
      </div>
    </motion.div>
  );
}

// ── Floating chart decoration ──────────────────────────────────────────────────
function FloatingChart({ style }) {
  const points = "20,80 60,55 100,65 140,30 180,45 220,15 260,35 300,20";
  return (
    <motion.div style={{ position: "absolute", pointerEvents: "none", ...style }}
      animate={{ y: [0, -12, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
      <svg width="320" height="100" viewBox="0 0 320 100" fill="none" style={{ opacity: 0.08 }}>
        <defs>
          <linearGradient id="cg" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
          <linearGradient id="fg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" /><stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={"M" + points.replace(/ /g, " L")} stroke="url(#cg)" strokeWidth="2.5" strokeLinecap="round" />
        <path d={"M20,80 " + points.slice(3) + " L300,100 L20,100 Z"} fill="url(#fg)" />
      </svg>
    </motion.div>
  );
}

// ── Features ───────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: (<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>),
    color: "#6366f1", tag: "ANALYTICS", title: "Smart Analytics",
    desc: "Visual charts reveal your spending DNA — where every rupee flows, every pattern emerges.",
    stat: "360°", statLabel: "Financial view",
  },
  {
    icon: (<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>),
    color: "#a855f7", tag: "REAL-TIME", title: "Instant Tracking",
    desc: "Every transaction captured and categorized the moment it happens. Zero lag. Full clarity.",
    stat: "<1s", statLabel: "Capture speed",
  },
  {
    icon: (<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>),
    color: "#22c55e", tag: "GOALS", title: "Savings Goals",
    desc: "Set targets, visualize milestones, and watch your wealth compound toward the life you want.",
    stat: "Track", statLabel: "Every goal",
  },
  {
    icon: (<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>),
    color: "#ec4899", tag: "AI POWERED", title: "AI Assistant",
    desc: "Your personal CFO in your pocket. Asks the right questions, finds the right answers.",
    stat: "24/7", statLabel: "AI guidance",
  },
];

const STEPS = [
  { n: "01", title: "Add Your Transactions", desc: "Log income and expenses manually in seconds. Clean, fast, zero friction." },
  { n: "02", title: "AI Categorizes Everything", desc: "Every entry is instantly sorted — food, travel, EMIs, subscriptions, income. No manual tagging." },
  { n: "03", title: "See Your Whole Picture", desc: "Your dashboard surfaces trends, budget health, and insights automatically. Just open and understand." },
];

// ── Main ───────────────────────────────────────────────────────────────────────
function Welcome() {
  const [activeFeature, setActiveFeature] = useState(0);

  return (
    <div style={{
      minHeight: "100vh", overflowX: "hidden",
      background: "linear-gradient(160deg, #040210 0%, #06041a 30%, #09061f 60%, #050214 100%)",
      fontFamily: "'SF Pro Display','Helvetica Neue',system-ui,sans-serif",
      color: "white",
    }}>
      <DataStreamCanvas />

      {/* Ambient orbs */}
      {[
        { w:700, h:700, top:"-15%", left:"-10%", c:"rgba(99,102,241,0.15)", dur:20 },
        { w:500, h:500, top:"40%",  left:"65%",  c:"rgba(168,85,247,0.12)", dur:25 },
        { w:400, h:400, top:"70%",  left:"-5%",  c:"rgba(34,197,94,0.08)",  dur:18 },
        { w:300, h:300, top:"20%",  left:"75%",  c:"rgba(236,72,153,0.07)", dur:22 },
      ].map((o, i) => (
        <motion.div key={i} style={{
          position: "fixed", borderRadius: "50%", pointerEvents: "none", zIndex: 0,
          width: o.w, height: o.h, top: o.top, left: o.left,
          background: `radial-gradient(circle,${o.c} 0%,transparent 70%)`,
        }}
          animate={{ scale: [1, 1.12, 1], rotate: [0, i % 2 === 0 ? 10 : -10, 0] }}
          transition={{ duration: o.dur, repeat: Infinity, ease: "easeInOut" }} />
      ))}

      <Navbar />

      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <section style={{
        minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "120px 24px 80px", position: "relative", zIndex: 10, textAlign: "center",
      }}>
        <FloatingChart style={{ top: "18%", left: "4%" }} />
        <FloatingChart style={{ top: "22%", right: "3%", transform: "scaleX(-1)" }} />

        {/* Badge */}
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.28)",
            borderRadius: 100, padding: "7px 20px", marginBottom: 36,
          }}>
          <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.8, repeat: Infinity }}
            style={{ width: 6, height: 6, background: "#4ade80", borderRadius: "50%", boxShadow: "0 0 8px #4ade80" }} />
          <span style={{ fontSize: 12.5, fontWeight: 700, color: "#a5b4fc", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            AI-Powered Finance Intelligence
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{ fontSize: "clamp(44px, 8vw, 88px)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 1.0, margin: "0 0 8px", maxWidth: 900 }}>
          Know where every
        </motion.h1>
        <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.42, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontSize: "clamp(44px, 8vw, 88px)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 1.1, margin: "0 0 32px",
            background: "linear-gradient(135deg, #818cf8 0%, #c084fc 45%, #34d399 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            paddingBottom: "0.12em",
          }}>
          rupee goes.
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.55 }}
          style={{ fontSize: "clamp(15px,2vw,19px)", color: "rgba(255,255,255,0.38)", lineHeight: 1.75, margin: "0 0 52px", maxWidth: 560 }}>
          Track expenses, set goals, and unlock AI-powered insights —<br />all in one beautiful dashboard built for you.
        </motion.p>

        {/* Buttons */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.68 }}
          style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 24 }}>
          <Link to="/signup" style={{ textDecoration: "none" }}>
            <motion.button whileHover={{ scale: 1.04, boxShadow: "0 20px 60px rgba(99,102,241,0.6)" }} whileTap={{ scale: 0.97 }}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "17px 38px", fontSize: 15.5, fontWeight: 800, fontFamily: "inherit",
                background: "linear-gradient(135deg, #4338ca 0%, #6d28d9 50%, #9333ea 100%)",
                color: "white", border: "none", borderRadius: 14, cursor: "pointer",
                boxShadow: "0 10px 32px rgba(99,102,241,0.45), inset 0 1px 0 rgba(255,255,255,0.15)",
              }}>
              Get Started — It's Free
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </motion.button>
          </Link>
          <Link to="/login" style={{ textDecoration: "none" }}>
            <motion.button whileHover={{ scale: 1.04, background: "rgba(255,255,255,0.09)", borderColor: "rgba(255,255,255,0.28)" }} whileTap={{ scale: 0.97 }}
              style={{ padding: "17px 38px", fontSize: 15.5, fontWeight: 700, fontFamily: "inherit", background: "rgba(255,255,255,0.05)", color: "white", border: "1px solid rgba(255,255,255,0.13)", borderRadius: 14, cursor: "pointer", transition: "all 0.2s" }}>
              Sign In
            </motion.button>
          </Link>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }}
          style={{ fontSize: 12.5, color: "rgba(255,255,255,0.2)", letterSpacing: "0.03em", marginBottom: 72 }}>
          No credit card required &nbsp;·&nbsp; Free forever &nbsp;·&nbsp; Secure & private
        </motion.p>

        {/* LIVE DASHBOARD MOCKUP */}
        <DashboardMockup />

        {/* Scroll cue */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
          style={{ marginTop: 60 }}>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.8, repeat: Infinity }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="2">
              <path d="M12 5v14M5 12l7 7 7-7"/>
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* ══ FEATURES ══════════════════════════════════════════════════════════ */}
      <section style={{ position: "relative", zIndex: 10, padding: "0 24px 120px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 72 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#6366f1", letterSpacing: "0.15em", textTransform: "uppercase", margin: "0 0 14px" }}>Everything you need</p>
            <h2 style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 900, letterSpacing: "-0.04em", margin: "0 0 16px" }}>
              Built different.{" "}
              <span style={{ background: "linear-gradient(135deg,#818cf8,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Priced free.
              </span>
            </h2>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.35)", margin: 0, maxWidth: 480, marginInline: "auto" }}>
              Four core pillars that give you total mastery over your financial life.
            </p>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "start" }}>
            {/* Feature tabs */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {FEATURES.map((f, i) => {
                const rgb = f.color === "#6366f1" ? "99,102,241" : f.color === "#a855f7" ? "168,85,247" : f.color === "#22c55e" ? "34,197,94" : "236,72,153";
                return (
                  <motion.div key={i} onClick={() => setActiveFeature(i)} whileHover={{ x: 4 }}
                    initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                    style={{
                      padding: "20px 24px", borderRadius: 16, cursor: "pointer",
                      border: activeFeature === i ? `1px solid ${f.color}40` : "1px solid rgba(255,255,255,0.06)",
                      background: activeFeature === i ? `rgba(${rgb},0.08)` : "rgba(255,255,255,0.02)",
                      transition: "all 0.25s", display: "flex", alignItems: "center", gap: 16,
                    }}>
                    <div style={{
                      width: 46, height: 46, borderRadius: 13, flexShrink: 0,
                      background: `rgba(${rgb},0.15)`, border: `1px solid ${f.color}30`,
                      display: "flex", alignItems: "center", justifyContent: "center", color: f.color,
                    }}>
                      {f.icon}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: f.color, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 3 }}>{f.tag}</p>
                      <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: activeFeature === i ? "white" : "rgba(255,255,255,0.55)" }}>{f.title}</p>
                    </div>
                    {activeFeature === i && (
                      <div style={{ marginLeft: "auto", flexShrink: 0, color: f.color }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Feature detail */}
            <AnimatePresence mode="wait">
              <motion.div key={activeFeature}
                initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.97 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid ${FEATURES[activeFeature].color}25`,
                  borderRadius: 22, padding: "44px 40px",
                  boxShadow: `0 40px 100px rgba(0,0,0,0.5), 0 0 60px rgba(${FEATURES[activeFeature].color === "#6366f1" ? "99,102,241" : FEATURES[activeFeature].color === "#a855f7" ? "168,85,247" : FEATURES[activeFeature].color === "#22c55e" ? "34,197,94" : "236,72,153"},0.12)`,
                  position: "sticky", top: 100,
                }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 18, marginBottom: 28,
                  background: `rgba(${FEATURES[activeFeature].color === "#6366f1" ? "99,102,241" : FEATURES[activeFeature].color === "#a855f7" ? "168,85,247" : FEATURES[activeFeature].color === "#22c55e" ? "34,197,94" : "236,72,153"},0.15)`,
                  border: `1px solid ${FEATURES[activeFeature].color}35`,
                  display: "flex", alignItems: "center", justifyContent: "center", color: FEATURES[activeFeature].color,
                }}>
                  {React.cloneElement(FEATURES[activeFeature].icon, { width: 30, height: 30 })}
                </div>
                <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, color: FEATURES[activeFeature].color, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  {FEATURES[activeFeature].tag}
                </p>
                <h3 style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.04em", margin: "0 0 16px" }}>{FEATURES[activeFeature].title}</h3>
                <p style={{ fontSize: 16, color: "rgba(255,255,255,0.45)", lineHeight: 1.75, margin: "0 0 36px" }}>{FEATURES[activeFeature].desc}</p>
                <div style={{
                  display: "flex", alignItems: "center", gap: 20, padding: "20px 24px", borderRadius: 14,
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 36, fontWeight: 900, letterSpacing: "-0.04em", color: FEATURES[activeFeature].color }}>{FEATURES[activeFeature].stat}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>{FEATURES[activeFeature].statLabel}</p>
                  </div>
                  <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
                  <Link to="/signup" style={{ textDecoration: "none" }}>
                    <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                      style={{
                        padding: "10px 22px", background: FEATURES[activeFeature].color,
                        color: "white", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700,
                        cursor: "pointer", fontFamily: "inherit",
                      }}>
                      Try it →
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══════════════════════════════════════════════════════ */}
      <section style={{ position: "relative", zIndex: 10, padding: "0 24px 120px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#a855f7", letterSpacing: "0.15em", textTransform: "uppercase", margin: "0 0 14px" }}>How it works</p>
            <h2 style={{ fontSize: "clamp(26px,4vw,44px)", fontWeight: 900, letterSpacing: "-0.04em", margin: 0 }}>
              Up and running in{" "}
              <span style={{ background: "linear-gradient(135deg,#a855f7,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                60 seconds.
              </span>
            </h2>
          </motion.div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {STEPS.map((step, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.6 }}
                style={{
                  display: "flex", gap: 28, alignItems: "flex-start",
                  padding: "32px 36px", borderRadius: 18,
                  background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)",
                }}>
                <div style={{ fontSize: 48, fontWeight: 900, lineHeight: 1, letterSpacing: "-0.06em", color: "rgba(99,102,241,0.15)", flexShrink: 0, minWidth: 64 }}>
                  {step.n}
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 8px", letterSpacing: "-0.02em" }}>{step.title}</h3>
                  <p style={{ fontSize: 14.5, color: "rgba(255,255,255,0.38)", margin: 0, lineHeight: 1.65 }}>{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ════════════════════════════════════════════════════════ */}
      <section style={{ position: "relative", zIndex: 10, padding: "0 24px 100px" }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.8 }}
          style={{
            maxWidth: 780, margin: "0 auto", textAlign: "center", padding: "72px 48px",
            background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.18)",
            borderRadius: 28, boxShadow: "0 0 120px rgba(99,102,241,0.12)",
            position: "relative", overflow: "hidden",
          }}>
          <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: 1, background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.7), rgba(168,85,247,0.7), transparent)" }} />
          <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            style={{ width: 60, height: 60, margin: "0 auto 28px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src="data:image/png;base64,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" alt="FinSight" style={{width:60,height:60,objectFit:"contain"}}/>
          </motion.div>
          <h2 style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 900, letterSpacing: "-0.04em", margin: "0 0 16px" }}>
            Start for free.{" "}
            <span style={{ background: "linear-gradient(135deg,#818cf8,#a855f7,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Stay forever.
            </span>
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.38)", margin: "0 0 44px", lineHeight: 1.65 }}>
            Sign up, add your first transaction, and see your financial life get clearer immediately.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/signup" style={{ textDecoration: "none" }}>
              <motion.button whileHover={{ scale: 1.05, boxShadow: "0 20px 60px rgba(99,102,241,0.65)" }} whileTap={{ scale: 0.97 }}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "17px 40px", fontSize: 16, fontWeight: 800, fontFamily: "inherit", background: "linear-gradient(135deg, #4338ca, #6d28d9, #9333ea)", color: "white", border: "none", borderRadius: 14, cursor: "pointer", boxShadow: "0 10px 36px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.15)" }}>
                Create Free Account
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </motion.button>
            </Link>
            <Link to="/login" style={{ textDecoration: "none" }}>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                style={{ padding: "17px 40px", fontSize: 16, fontWeight: 700, fontFamily: "inherit", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, cursor: "pointer" }}>
                Sign In Instead
              </motion.button>
            </Link>
          </div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", marginTop: 24, letterSpacing: "0.03em" }}>
            🔒 JWT encrypted &nbsp;·&nbsp; No credit card &nbsp;·&nbsp; Your data stays yours
          </p>
        </motion.div>
      </section>

      {/* ══ FOOTER ═══════════════════════════════════════════════════════════ */}
      <footer style={{
        position: "relative", zIndex: 10,
        borderTop: "1px solid rgba(255,255,255,0.05)",
        padding: "32px 48px",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <img src="data:image/png;base64,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" alt="FinSight" style={{width:20,height:20,objectFit:"contain",borderRadius:6}}/>
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "-0.02em" }}>FinSight</span>
        </div>
        <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.18)", margin: 0 }}>
          Built with heart · Secure & private · Your data never leaves your account
        </p>
        <div style={{ display: "flex", gap: 20 }}>
          {["Privacy", "Terms", "Security"].map(l => (
            <span key={l} style={{ fontSize: 12.5, color: "rgba(255,255,255,0.2)", cursor: "default" }}>{l}</span>
          ))}
        </div>
      </footer>
    </div>
  );
}

export default Welcome;