import { ssrRenderAttr } from 'vue/server-renderer';
import { p as publicAssetsURL } from '../routes/renderer.mjs';
import { useSSRContext } from 'vue';
import 'vue-bundle-renderer/runtime';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';

const _imports_0 = publicAssetsURL("/img/vectorink-vectorizer-result.svg");
const _imports_1 = publicAssetsURL("/img/dark-theme-svgrepo-com.svg");
const _sfc_main = {
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[--><div class="container"><div id="offline-banner" class="offline-banner hidden"> 📡 <span id="offline-text">You are offline - using local storage</span></div><header><div class="header-top"><img${ssrRenderAttr("src", _imports_0)} alt="BlockLogic" class="logo"><div class="theme-toggle"><label class="toggle-switch"><input id="theme-toggle" type="checkbox"><span class="toggle-slider"></span></label><img${ssrRenderAttr("src", _imports_1)} alt="Toggle theme" class="theme-icon"></div></div><div class="score-display"><div class="score-item"><span class="score-label">Score:</span><span id="current-score" class="score-value">0</span></div><div class="score-item"><span class="score-label">High Score:</span><span id="high-score" class="score-value">0</span></div></div></header><main><div class="game-area"><canvas id="game-canvas"></canvas><button id="restart-btn" class="game-button">Restart Game</button></div><aside id="leaderboard-container"><h2>Leaderboard</h2><div id="leaderboard-loading" class="loading">Loading...</div><ol id="leaderboard-list" class="hidden"></ol><button id="refresh-leaderboard-btn" class="game-button">Refresh</button></aside></main></div><div id="game-over-modal" class="modal hidden"><div class="modal-content"><h2>Game Over!</h2><p class="final-score">Score: <span id="final-score">0</span></p><p class="high-score-text">High Score: <span id="modal-high-score">0</span></p><div class="username-input"><label for="username">Enter Name:</label><input id="username" type="text" maxlength="20" placeholder="Player"></div><div class="modal-buttons"><button id="submit-score-btn" class="game-button">Submit Score</button><button id="play-again-btn" class="game-button">Play Again</button></div></div></div><div id="dialog-modal" class="modal hidden"><div class="modal-content dialog-content"><p id="dialog-message"></p><div class="modal-buttons"><button id="dialog-ok-btn" class="game-button">OK</button></div></div></div><div id="confirm-modal" class="modal hidden"><div class="modal-content dialog-content"><p id="confirm-message"></p><div class="modal-buttons"><button id="confirm-yes-btn" class="game-button">Yes</button><button id="confirm-no-btn" class="game-button secondary">No</button></div></div></div><!--]-->`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-DtbgvEkW.mjs.map
