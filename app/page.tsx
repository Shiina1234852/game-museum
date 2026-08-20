"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { dimensions, games, type Game } from "./game-data";

type StyleVars = CSSProperties & Record<`--${string}`, string>;

const topGames = games.slice(0, 5);
const records = games.filter((game) => game.record);
const tierShelves = [
  { tier: "一档", roman: "Ⅰ", title: "核心馆藏", english: "MASTERPIECE COLLECTION", note: "真正定义我审美与偏好的作品" },
  { tier: "二档", roman: "Ⅱ", title: "喜爱之作", english: "BELOVED SELECTION", note: "很喜欢，也愿意一次次向别人聊起的游戏" },
  { tier: "三档", roman: "Ⅲ", title: "游玩手记", english: "PLAYED & REMEMBERED", note: "它们共同拼成了这段完整而鲜活的游玩轨迹" },
] as const;
const mashiroSparkles = Array.from({ length: 48 }, (_, index) => ({
  x: (index * 37 + 11) % 100,
  y: (index * 61 + 7) % 100,
  size: 2 + (index % 5),
  delay: (index % 12) * 70,
  hue: [4, 38, 191, 216, 326][index % 5],
}));

function posterFor(game: Game) {
  if (game.id === "pragmata" || game.id === "re-requiem") return assetUrl(`games/${game.id}/poster.webp`);
  return assetUrl(`games/${game.id}/poster.jpg`);
}

function screenshotsFor(game: Game) {
  return [1, 2, 3].map((index) => assetUrl(`games/${game.id}/shot-${index}.jpg`));
}

function assetUrl(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
}

function lines(title: string) {
  const parts = title.split(/[:：]/);
  return parts.length > 1 ? [`${parts[0]}：`, parts.slice(1).join("：")] : [title];
}

function tierClass(tier: Game["tier"]) {
  if (tier === "一档") return "is-masterpiece";
  if (tier === "二档") return "is-featured";
  return "is-field-note";
}

export default function Home() {
  const [activeId, setActiveId] = useState(topGames[0].id);
  const [tier, setTier] = useState<"全部" | Game["tier"]>("全部");
  const [query, setQuery] = useState("");
  const [latestFirst, setLatestFirst] = useState(false);
  const [selected, setSelected] = useState<Game | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [dimensionId, setDimensionId] = useState(dimensions[0].id);
  const [pulse, setPulse] = useState(true);
  const [mashiroEgg, setMashiroEgg] = useState(false);

  const active = games.find((game) => game.id === activeId) ?? topGames[0];
  const selectedGallery = selected ? [posterFor(selected), ...screenshotsFor(selected)] : [];
  const activeDimension = dimensions.find((item) => item.id === dimensionId) ?? dimensions[0];
  const dimensionGames = activeDimension.gameIds
    .map((id) => games.find((game) => game.id === id))
    .filter(Boolean) as Game[];

  const visibleGames = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const filtered = games.filter((game) => {
      const tierMatches = tier === "全部" || game.tier === tier;
      const textMatches = !normalized || [game.title, game.subtitle, game.genre, ...game.tags]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
      return tierMatches && textMatches;
    });
    return [...filtered].sort((a, b) => latestFirst
      ? Number(b.year) - Number(a.year) || b.score - a.score
      : b.score - a.score);
  }, [latestFirst, query, tier]);

  useEffect(() => {
    document.body.style.overflow = selected || mashiroEgg ? "hidden" : "";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (mashiroEgg) setMashiroEgg(false);
        else setSelected(null);
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [mashiroEgg, selected]);

  const handlePointer = (event: ReactPointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--my", `${event.clientY - rect.top}px`);
  };

  const openGame = (game: Game) => {
    setSelected(game);
    setGalleryIndex(0);
  };

  return (
    <main
      className={`museum-shell${pulse ? " pulse-on" : ""}`}
      style={{ "--accent": active.color, "--accent-2": active.color2 } as StyleVars}
      onPointerMove={handlePointer}
    >
      <div className="ambient-grid" aria-hidden="true" />
      <div className="cursor-light" aria-hidden="true" />
      <div className="mashiro-signatures">
        <span aria-hidden="true">ROOM 202</span>
        <button
          className="mashiro-egg-trigger"
          type="button"
          onClick={() => setMashiroEgg(true)}
          aria-label="一枚几乎看不见的铅笔签名"
          title="这好像不是装饰……"
        >
          ま
        </button>
        <span aria-hidden="true">BAUM / 08</span>
        <span aria-hidden="true">CANVAS 31</span>
      </div>

      <header className="topbar">
        <a className="wordmark" href="#top" aria-label="回到首页">
          <span>ROOM</span>
          <b>202</b>
        </a>
        <nav aria-label="主导航">
          <a href="#universe">游戏宇宙</a>
          <a href="#ranking">我的排名</a>
          <a href="#records">个人纪录</a>
          <a href="#profile">偏好图谱</a>
        </nav>
        <button
          className={`pulse-toggle${pulse ? " is-on" : ""}`}
          type="button"
          onClick={() => setPulse((value) => !value)}
          aria-pressed={pulse}
        >
          <i><span /></i>
          <span>CANVAS GRAIN {pulse ? "ON" : "OFF"}</span>
        </button>
      </header>

      <section className="hero section-frame" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span /> A PERSONAL GAME SKETCHBOOK</p>
          <h1>我的<br /><em>游戏宇宙</em></h1>
          <p className="intro">
            这不是客观榜单。<br />
            而是 <strong>31 段亲历世界</strong>，在记忆中的坐标。
          </p>
          <div className="hero-stats" aria-label="榜单概览">
            <div><b>31</b><span>已完成画页</span></div>
            <div><b>05</b><span>重点装裱</span></div>
            <div><b>9.9</b><span>最高落款</span></div>
          </div>
          <aside className="curator-card" aria-label="策展序言">
            <span>CURATOR&apos;S NOTE · 202</span>
            <p>我记住的从来不只是玩法，而是某个角色的眼神、某段旅途的余温，以及通关后仍没有散去的情绪。</p>
            <div className="collection-tags" aria-label="收藏偏好">
              <i>CHARACTER</i><i>NARRATIVE</i><i>COMBAT</i><i>ATMOSPHERE</i>
            </div>
            <button
              className="curator-mashiro-seal"
              type="button"
              onClick={() => setMashiroEgg(true)}
              aria-label="打开一枚不属于展签的神秘落款"
              title="这枚落款似乎可以触碰……"
            >
              ま
            </button>
          </aside>
        </div>

        <div className="universe" id="universe" aria-label="一档游戏星图">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="orbit orbit-three" />
          <button className="core-card" type="button" onClick={() => openGame(active)}>
            <img className="core-image" src={posterFor(active)} alt="" />
            <span className="core-kicker">CURRENT CANVAS · 202</span>
            <b className="core-score">{active.score.toFixed(1)}</b>
            <h2>{lines(active.title).map((line) => <span key={line}>{line}</span>)}</h2>
            <p>{active.note}</p>
            <div className="core-meta"><span>一档</span><span>{active.year}</span></div>
            <span className="open-hint">翻开这一页 ↗</span>
          </button>

          {topGames.map((game, index) => (
            <button
              className={`planet planet-${index + 1}${activeId === game.id ? " is-active" : ""}`}
              key={game.id}
              type="button"
              onMouseEnter={() => setActiveId(game.id)}
              onFocus={() => setActiveId(game.id)}
              onClick={() => setActiveId(game.id)}
              aria-label={`${game.title}，评分 ${game.score}`}
            >
              <span className="planet-dot" style={{ background: game.color }} />
              <span className="planet-copy">
                <b>{game.score.toFixed(1)}</b>
                <small>{game.subtitle}</small>
              </span>
            </button>
          ))}
          <span className="star star-one" />
          <span className="star star-two" />
          <span className="star star-three" />
        </div>

        <a className="scroll-cue" href="#ranking">
          <span>OPEN THE SKETCHBOOK</span><i />
        </a>
      </section>

      <section className="ranking-section section-frame" id="ranking">
        <div className="section-heading">
          <div>
            <p className="section-index">SKETCH 02 / THE RANKING</p>
            <h2>记忆，<em>依次陈列</em></h2>
          </div>
          <p className="section-note">评分只描述我的体验，不负责说服任何人。<br />点击任意作品，进入它的独立档案。</p>
        </div>

        <div className="exhibition-legend" aria-label="档位导览">
          <div><b>Ⅰ</b><span><small>PERMANENT</small>构成审美坐标的核心馆藏</span></div>
          <div><b>Ⅱ</b><span><small>SELECTED</small>愿意反复谈起的喜爱之作</span></div>
          <div><b>Ⅲ</b><span><small>MEMORIES</small>共同拼成旅程的游玩手记</span></div>
        </div>

        <div className="archive-controls">
          <div className="tier-tabs" role="group" aria-label="按档位筛选">
            {(["全部", "一档", "二档", "三档"] as const).map((item) => (
              <button
                key={item}
                className={tier === item ? "is-active" : ""}
                type="button"
                onClick={() => setTier(item)}
              >
                {item}<sup>{item === "全部" ? 31 : games.filter((game) => game.tier === item).length}</sup>
              </button>
            ))}
          </div>
          <label className="archive-search">
            <span>⌕</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索游戏、类型或标签"
              aria-label="搜索游戏"
            />
            {query && <button type="button" onClick={() => setQuery("")} aria-label="清空搜索">×</button>}
          </label>
          <button className="sort-button" type="button" onClick={() => setLatestFirst((value) => !value)}>
            {latestFirst ? "按年份 ↓" : "按评分 ↓"}
          </button>
        </div>

        <div className="result-line">
          <span>DISPLAYING {String(visibleGames.length).padStart(2, "0")} PANELS</span>
          <i />
        </div>

        {visibleGames.length > 0 ? (
          <div className="tier-shelves">
            {tierShelves.map((shelf) => {
              const shelfGames = visibleGames.filter((game) => game.tier === shelf.tier);
              if (shelfGames.length === 0) return null;
              return (
                <section className={`tier-shelf tier-shelf-${shelf.tier === "一档" ? "one" : shelf.tier === "二档" ? "two" : "three"}`} key={shelf.tier}>
                  <header className="tier-shelf-head">
                    <span className="tier-roman" aria-hidden="true">{shelf.roman}</span>
                    <div>
                      <small>{shelf.english}</small>
                      <h3>{shelf.title}</h3>
                      <p>{shelf.note}</p>
                    </div>
                    <b>{String(shelfGames.length).padStart(2, "0")}<small> WORKS</small></b>
                  </header>
                  {shelf.tier === "一档" && (
                    <div className="masterpiece-manifesto">
                      <span>THE DEFINITIVE FIVE</span>
                      <p>它们不是简单的高分游戏，而是整座私人博物馆的中心坐标。</p>
                      <i>ROOM 202 · PERMANENT COLLECTION</i>
                    </div>
                  )}
                  <div className="game-grid">
                    {shelfGames.map((game) => {
                      const rank = games.findIndex((item) => item.id === game.id) + 1;
                      const cardStyle = {
                        "--card-accent": game.color,
                        "--card-dark": game.color2,
                      } as StyleVars;
                      const isMasterpiece = game.tier === "一档";
                      return (
                        <button
                          className={`game-card ${tierClass(game.tier)}`}
                          key={game.id}
                          type="button"
                          style={cardStyle}
                          onClick={() => openGame(game)}
                          onPointerMove={isMasterpiece ? handlePointer : undefined}
                        >
                          {isMasterpiece ? (
                            <>
                              <span className="masterpiece-frame" aria-hidden="true"><i /><i /><i /><i /></span>
                              <span className="masterpiece-stars" aria-hidden="true">
                                {Array.from({ length: 9 }, (_, index) => <i key={index} />)}
                              </span>
                              <span className="masterpiece-plaque"><small>ROOM 202 COLLECTION</small><b>MASTERPIECE</b></span>
                            </>
                          ) : (
                            <span className="tier-card-plaque">
                              <small>{game.tier === "二档" ? "BELOVED SELECTION" : "MEMORY COLLECTION"}</small>
                              <b>{game.tier === "二档" ? "Ⅱ" : "Ⅲ"}</b>
                            </span>
                          )}
                          <span className="card-rank">{String(rank).padStart(2, "0")}</span>
                          <span className="card-art" aria-hidden="true">
                            <img className="card-cover" src={posterFor(game)} alt="" loading="lazy" />
                            <i className="card-horizon"><small>202 / M</small></i>
                            <b>{game.mark}</b>
                            <small>{game.year}</small>
                          </span>
                          <span className="card-content">
                            <span className="card-topline"><em>{game.tier}</em><strong>{game.score.toFixed(1)}</strong></span>
                            <span className="card-title">{game.title}</span>
                            <span className="card-subtitle">{game.subtitle}</span>
                            <span className="card-tags">{game.tags.map((tag) => <i key={tag}>{tag}</i>)}</span>
                          </span>
                          <span className="card-open">TURN THE PAGE <i>↗</i></span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <b>没有找到这个坐标</b>
            <p>换一个关键词，或者返回查看全部 31 部作品。</p>
            <button type="button" onClick={() => { setQuery(""); setTier("全部"); }}>重置筛选</button>
          </div>
        )}
      </section>

      <section className="records-section" id="records">
        <div className="section-frame">
          <div className="section-heading records-heading">
            <div>
              <p className="section-index">PANEL 03 / PERSONAL RECORDS</p>
              <h2>只属于我的，<em>天花板</em></h2>
            </div>
            <p className="section-note">这里的“天花板”从来不是行业定论。<br />它只表示：在我玩过的游戏中，暂时没有谁超过它。</p>
          </div>

          <div className="record-stage">
            {records.map((game, index) => (
              <button
                type="button"
                className="record-card"
                key={game.id}
                onClick={() => openGame(game)}
                style={{ "--record": game.color, "--record-dark": game.color2 } as StyleVars}
              >
                <span className="record-number">0{index + 1}</span>
                <span className="record-symbol">{game.mark}</span>
                <span className="record-copy">
                  <small>PRIVATE FRAME · 202</small>
                  <strong>{game.record?.replace("在我玩过的游戏中，", "")}</strong>
                  <em>{game.title}</em>
                </span>
                <span className="record-arrow">↗</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="profile-section section-frame" id="profile">
        <div className="section-heading">
          <div>
            <p className="section-index">DRAFT 04 / PLAYER PROFILE</p>
            <h2>我的偏好，<em>并非秘密</em></h2>
          </div>
          <p className="section-note">排名背后有一条稳定的引力轨迹：<br />我在寻找角色、氛围、选择与战斗之间的共振。</p>
        </div>

        <div className="profile-board">
          <div className="dimension-list" role="tablist" aria-label="偏好维度">
            {dimensions.map((item, index) => (
              <button
                type="button"
                role="tab"
                aria-selected={dimensionId === item.id}
                className={dimensionId === item.id ? "is-active" : ""}
                key={item.id}
                onClick={() => setDimensionId(item.id)}
              >
                <span>0{index + 1}</span>
                <strong>{item.label}</strong>
                <i><em style={{ width: `${item.value}%` }} /></i>
                <b>{item.value}</b>
              </button>
            ))}
          </div>

          <div className="preference-constellation" style={{ "--profile": `${activeDimension.value}%` } as StyleVars}>
            <div className="radar-rings" aria-hidden="true"><i /><i /><i /></div>
            <div className="preference-copy">
              <small>ACTIVE DIMENSION · {activeDimension.value}</small>
              <h3>{activeDimension.label}</h3>
              <p>{activeDimension.description}</p>
            </div>
            <div className="dimension-games">
              {dimensionGames.map((game, index) => (
                <button
                  type="button"
                  key={game.id}
                  className={`dimension-game dimension-game-${index + 1}`}
                  onClick={() => openGame(game)}
                  style={{ "--node": game.color } as StyleVars}
                >
                  <i />
                  <span><b>{game.score.toFixed(1)}</b><small>{game.title}</small></span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="closing-section">
        <div className="closing-orb" aria-hidden="true"><span>31</span></div>
        <p>THE SKETCHBOOK REMAINS OPEN</p>
        <h2>下一部喜欢的游戏，<br />会落在哪个坐标？</h2>
        <a href="#top">回到宇宙起点 <span>↑</span></a>
      </section>

      <footer>
        <span>ROOM 202 · PERSONAL GAME SKETCHBOOK</span>
        <span>31 WORLDS / ONE QUIET CANVAS</span>
      </footer>

      {mashiroEgg && (
        <div
          className="mashiro-egg"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mashiro-egg-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setMashiroEgg(false);
          }}
        >
          <button className="egg-close" type="button" onClick={() => setMashiroEgg(false)} aria-label="关闭椎名真白彩蛋">×</button>
          <div className="egg-paper-noise" aria-hidden="true" />
          <div className="egg-color-sheets" aria-hidden="true"><i /><i /><i /></div>
          <div className="egg-doodles" aria-hidden="true">
            {Array.from({ length: 9 }, (_, index) => <i key={index}>{index % 3 === 0 ? "✦" : index % 3 === 1 ? "♡" : "ねこ"}</i>)}
          </div>
          <div className="egg-sparkles" aria-hidden="true">
            {mashiroSparkles.map((sparkle, index) => (
              <i
                key={index}
                style={{
                  "--x": `${sparkle.x}%`,
                  "--y": `${sparkle.y}%`,
                  "--size": `${sparkle.size}px`,
                  "--delay": `${sparkle.delay}ms`,
                  "--hue": String(sparkle.hue),
                } as StyleVars}
              />
            ))}
          </div>
          <section className="egg-pop-card">
            <header className="egg-pop-head">
              <span>SAKURASOU / SPECIAL PAGE</span>
              <b>ROOM NO. 202</b>
            </header>
            <div className="egg-pop-layout">
              <div className="egg-pop-copy">
                <p>SECRET CHARACTER FOUND!</p>
                <h2 id="mashiro-egg-title"><span>椎名</span><strong>ましろ</strong></h2>
                <p className="egg-pop-note">深色的游戏宇宙之外，<br />藏着一页只属于真白的明亮画纸。</p>
                <div className="egg-pop-stickers" aria-label="椎名真白彩蛋暗号">
                  <span>天才画家</span>
                  <span>年轮蛋糕</span>
                  <span>猫与漫画</span>
                </div>
              </div>
              <figure className="egg-mashiro-frame">
                <img src={assetUrl("mashiro-rooftop.jpg")} alt="《樱花庄的宠物女孩》椎名真白坐在天台上的插画" />
                <figcaption>SHIINA MASHIRO · SAKURASOU NO PET NA KANOJO</figcaption>
              </figure>
            </div>
            <footer className="egg-pop-foot">
              <small>© 鴨志田一 / アスキー・メディアワークス / さくら荘製作委員会</small>
              <button className="egg-exit" type="button" onClick={() => setMashiroEgg(false)}>
                返回游戏宇宙 <span>↗</span>
              </button>
            </footer>
          </section>
          <div className="egg-marquee" aria-hidden="true">
            <span>SHIINA MASHIRO ♡ ROOM 202 ♡ BAUMKUCHEN ♡ SECRET CHARACTER ♡ </span>
            <span>SHIINA MASHIRO ♡ ROOM 202 ♡ BAUMKUCHEN ♡ SECRET CHARACTER ♡ </span>
          </div>
        </div>
      )}

      {selected && (
        <div className={`detail-overlay ${tierClass(selected.tier)}`} role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setSelected(null);
        }}>
          <button className="detail-close-mobile" type="button" onClick={() => setSelected(null)} aria-label="关闭游戏详情">×</button>
          <article
            className={`detail-panel ${tierClass(selected.tier)}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="detail-title"
            style={{ "--detail": selected.color, "--detail-dark": selected.color2 } as StyleVars}
            tabIndex={-1}
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft") {
                setGalleryIndex((index) => (index + selectedGallery.length - 1) % selectedGallery.length);
              }
              if (event.key === "ArrowRight") {
                setGalleryIndex((index) => (index + 1) % selectedGallery.length);
              }
            }}
          >
            <button className="detail-close" type="button" onClick={() => setSelected(null)} aria-label="关闭档案">×</button>
            {selected.tier === "一档" && (
              <span className="detail-masterpiece-seal" aria-label="一档杰作馆藏">
                <i>Ⅰ</i><span><small>ROOM 202</small><b>MASTERPIECE ARCHIVE</b></span>
              </span>
            )}
            {selected.tier !== "一档" && (
              <span className="detail-tier-seal" aria-label={`${selected.tier}游戏档案`}>
                <i>{selected.tier === "二档" ? "Ⅱ" : "Ⅲ"}</i>
                <span><small>ROOM 202</small><b>{selected.tier === "二档" ? "BELOVED SELECTION" : "MEMORY COLLECTION"}</b></span>
              </span>
            )}
            <div className="detail-art">
              <a
                className="detail-image-link"
                href={selectedGallery[galleryIndex]}
                target="_blank"
                rel="noreferrer"
                aria-label={galleryIndex === 0 ? `以原始尺寸打开《${selected.title}》完整海报` : `以原始尺寸打开《${selected.title}》游戏内截图 ${galleryIndex}`}
              >
                <img
                  className="detail-image"
                  src={selectedGallery[galleryIndex]}
                  alt={galleryIndex === 0 ? `${selected.title} 完整海报` : `${selected.title} 游戏内截图 ${galleryIndex}`}
                />
              </a>
              <span className="detail-grid" />
              <b className="detail-mark">{selected.mark}</b>
              <small>ROOM 202 · PAGE {String(games.findIndex((game) => game.id === selected.id) + 1).padStart(2, "0")}</small>
              <span className="detail-media-mode">
                {galleryIndex === 0 ? "FULL POSTER · 完整海报" : `IN-GAME · 实机画面 0${galleryIndex}`}
              </span>
              <span className="detail-original">点击图片查看原始尺寸 ↗</span>
              <div className="detail-gallery" aria-label="游戏图片画廊">
                {selectedGallery.map((image, index) => (
                  <button
                    type="button"
                    className={galleryIndex === index ? "is-active" : ""}
                    key={image}
                    onClick={() => setGalleryIndex(index)}
                    aria-label={index === 0 ? "查看完整游戏海报" : `查看游戏内截图 ${index}`}
                  >
                    <img src={image} alt="" />
                    <span>{String(index + 1).padStart(2, "0")}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="detail-content">
              <div className="detail-head">
                <span>{selected.tier} / {selected.year}</span>
                <b>{selected.score.toFixed(1)}</b>
              </div>
              <p className="detail-subtitle">{selected.subtitle}</p>
              <h2 id="detail-title">{selected.title}</h2>
              <p className="detail-note">{selected.note}</p>
              {selected.record && (
                <div className="detail-record">
                  <small>PERSONAL RECORD</small>
                  <strong>{selected.record}</strong>
                </div>
              )}
              <dl>
                <div><dt>类型</dt><dd>{selected.genre}</dd></div>
                <div><dt>记忆标签</dt><dd>{selected.tags.join(" · ")}</dd></div>
                <div><dt>榜单位置</dt><dd>NO. {String(games.findIndex((game) => game.id === selected.id) + 1).padStart(2, "0")}</dd></div>
              </dl>
              <p className="detail-disclaimer">所有评价只代表我的游玩感受与个人排序。</p>
            </div>
          </article>
        </div>
      )}
    </main>
  );
}
