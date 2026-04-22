/* Runtime helpers for TIPFIN — header/footer are inlined directly into each page. */
  (function(){
    function paintAuth(){
      let user = null;
      try { user = JSON.parse(localStorage.getItem("tipfin_user") || "null"); } catch {}
      const ctaHTML = user
        ? `<a class="btn btn-ghost" href="dashboard.html">📊 Dashboard</a>
           <button class="btn btn-primary" id="hdr-logout" type="button">Sign out</button>`
        : `<a class="btn btn-ghost" href="login.html">Sign in</a>
           <a class="btn btn-primary" href="register.html">Get started</a>`;
      document.querySelectorAll("[data-auth-cta]").forEach(el => el.innerHTML = ctaHTML);
      const mobileHTML = user
        ? `<a class="btn btn-ghost" href="dashboard.html">📊 Dashboard</a>
           <button class="btn btn-primary" id="mm-logout" type="button">Sign out</button>`
        : `<a class="btn btn-ghost" href="login.html">Sign in</a>
           <a class="btn btn-primary" href="register.html">Get started</a>`;
      document.querySelectorAll("[data-auth-cta-mobile]").forEach(el => el.innerHTML = mobileHTML);
      document.querySelectorAll("#hdr-logout, #mm-logout").forEach(b => {
        b.addEventListener("click", e => {
          e.preventDefault();
          try { localStorage.removeItem("tipfin_user"); } catch {}
          location.href = "index.html";
        });
      });
      document.querySelectorAll('.mobile-menu a[data-nav="profile.html"], .mobile-menu a[data-nav="dashboard.html"], .mobile-menu a[data-nav="apply.html"]').forEach(a=>{
        a.style.display = user ? "" : "none";
      });
    }

    function init(){
      paintAuth();
      window.addEventListener("storage", e=>{ if (e.key === "tipfin_user") paintAuth(); });
      window.addEventListener("tipfin-session", paintAuth);
      const burger = document.getElementById("hamburger");
      const menu = document.getElementById("mobile-menu");
      if (burger && menu){
        function close(){ menu.hidden = true; burger.classList.remove("open"); burger.setAttribute("aria-expanded","false"); document.body.classList.remove("mm-open"); }
        function open(){ menu.hidden = false; burger.classList.add("open"); burger.setAttribute("aria-expanded","true"); document.body.classList.add("mm-open"); }
        burger.addEventListener("click", e=>{
          e.stopPropagation();
          if (menu.hidden) open(); else close();
        });
        menu.addEventListener("click", e=>{ if (e.target.tagName === "A") close(); });
        document.addEventListener("click", e=>{
          if (!menu.hidden && !menu.contains(e.target) && e.target !== burger) close();
        });
        document.addEventListener("keydown", e=>{ if (e.key === "Escape") close(); });
      }
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
  })();
  