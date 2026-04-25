"use client";
import Nav from "@/components/Nav";
import { useState } from "react";

type Tab = "breakfast" | "appetizers" | "lunch" | "desserts" | "drinks";

const TABS: { id: Tab; label: string }[] = [
  { id: "breakfast", label: "Breakfast" },
  { id: "appetizers", label: "Appetizers" },
  { id: "lunch", label: "Lunch & Dinner" },
  { id: "desserts", label: "Desserts" },
  { id: "drinks", label: "Drinks" },
];

export default function CateringMenuPage() {
  const [activeTab, setActiveTab] = useState<Tab>("breakfast");

  return (
    <>
      <Nav />
      <style>{`
        :root {
          --navy: #243175;
          --navy-dark: #1a2459;
          --navy-light: #2d3d8a;
          --gold: #C9A84C;
          --cream: #F7F5F0;
          --cream-dark: #EEEAE2;
          --rule: #D6D1C6;
          --body-text: #1F2937;
          --muted: #64748B;
          --brand-blue: #2D3680;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Source Sans 3', Arial, sans-serif; background: var(--cream); color: var(--body-text); }

        /* ── Header ── */
        .catering-header {
          background: linear-gradient(160deg, var(--navy-dark) 0%, var(--navy) 55%, var(--navy-light) 100%);
          padding-top: calc(72px + 40px);
          padding-bottom: 40px;
          text-align: center;
        }
        .catering-header img.logo {
          width: 110px; height: 110px;
          border-radius: 50%;
          display: block;
          margin: 0 auto 14px;
        }
        .catering-header p.tagline {
          font-style: italic;
          font-size: 1rem;
          color: rgba(255,255,255,0.65);
          margin-top: 4px;
        }
        .header-rule {
          width: 56px; height: 2px;
          background: var(--gold);
          margin: 14px auto 0;
          border-radius: 2px;
        }

        /* ── Tabs ── */
        .tabs-wrapper {
          background: var(--brand-blue);
          position: sticky;
          top: 0;
          z-index: 100;
          border-top: 1px solid #3D4A9A;
        }
        .tabs {
          display: flex;
          overflow-x: auto;
          scrollbar-width: none;
          max-width: 860px;
          margin: 0 auto;
        }
        .tabs::-webkit-scrollbar { display: none; }
        .tab-btn {
          flex: 1 0 auto;
          background: none;
          border: none;
          color: #8A93B8;
          font-family: 'Source Sans 3', Arial, sans-serif;
          font-size: 0.85rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 1rem 1.25rem;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          white-space: nowrap;
          transition: color 0.2s, border-color 0.2s;
        }
        .tab-btn:hover { color: #F7F5F0; }
        .tab-btn.active {
          color: #F7F5F0;
          border-bottom-color: var(--gold);
        }

        /* ── Menu body ── */
        .menu-body {
          max-width: 780px;
          margin: 0 auto;
          padding: 3rem 1.5rem 5rem;
        }

        /* ── Section intro ── */
        .section-intro { text-align: center; margin-bottom: 2.5rem; }
        .section-intro h2 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.7rem, 4vw, 2.4rem);
          font-weight: 700;
          color: var(--brand-blue);
        }
        .section-intro .sub {
          margin-top: 0.5rem;
          color: var(--muted);
          font-size: 0.95rem;
        }
        .ornament {
          display: block;
          text-align: center;
          color: var(--gold);
          font-size: 1.1rem;
          letter-spacing: 0.3em;
          margin: 0.8rem 0;
        }

        /* ── Group title ── */
        .menu-group { margin-bottom: 2.8rem; }
        .group-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.25rem;
          font-weight: 600;
          font-style: italic;
          color: var(--gold);
          border-bottom: 1px solid var(--rule);
          padding-bottom: 0.5rem;
          margin-bottom: 1.2rem;
        }

        /* ── Menu item ── */
        .menu-item {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 0 1.5rem;
          margin-bottom: 1.4rem;
          align-items: start;
        }
        .item-name {
          font-family: 'Playfair Display', serif;
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--body-text);
          line-height: 1.3;
        }
        .item-desc {
          margin-top: 0.3rem;
          font-size: 0.9rem;
          color: var(--muted);
          line-height: 1.6;
        }
        .item-price {
          font-family: 'Source Sans 3', Arial, sans-serif;
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--brand-blue);
          white-space: nowrap;
          padding-top: 0.1rem;
        }

        /* Simple item */
        .menu-item.simple { margin-bottom: 0.8rem; }
        .menu-item.simple .item-name {
          font-family: 'Source Sans 3', Arial, sans-serif;
          font-weight: 400;
          font-size: 0.95rem;
        }
        .menu-item.simple .item-price {
          font-size: 0.95rem;
          font-weight: 600;
        }

        /* ── Options block ── */
        .options-block {
          background: var(--cream-dark);
          border-left: 3px solid var(--gold);
          border-radius: 0 6px 6px 0;
          padding: 1rem 1.25rem;
          margin: 1rem 0 1.6rem;
        }
        .opt-label {
          font-size: 0.72rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--gold);
          font-family: 'Source Sans 3', Arial, sans-serif;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        .options-block p {
          font-size: 0.9rem;
          color: var(--muted);
          line-height: 1.65;
        }

        /* ── Cake table ── */
        .size-table { width: 100%; border-collapse: collapse; margin-top: 0.6rem; font-size: 0.9rem; }
        .size-table td { padding: 0.4rem 0.6rem; border-bottom: 1px solid var(--rule); color: var(--muted); }
        .size-table td:last-child { text-align: right; font-weight: 600; color: var(--body-text); }

        /* ── Drinks ── */
        .drink-cat-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          font-style: italic;
          font-weight: 600;
          color: var(--body-text);
          text-align: center;
          margin: 2rem 0 0.3rem;
        }
        .drink-cat-sub { text-align: center; color: var(--muted); font-size: 0.9rem; margin-bottom: 0.8rem; }
        .drink-cat-price { text-align: center; font-family: 'Source Sans 3', Arial, sans-serif; font-size: 1.3rem; font-weight: 600; color: var(--brand-blue); margin-bottom: 1rem; }
        .drink-rule { border: none; border-top: 1px solid var(--rule); margin: 2rem 0; }

        /* ── Footer ── */
        .catering-footer {
          background: #0f1538;
          color: rgba(255,255,255,0.4);
          padding: 28px 40px;
          text-align: center;
          font-size: 12px;
        }

        @media (max-width: 520px) {
          .tab-btn { font-size: 0.75rem; padding: 0.9rem 0.9rem; }
          .menu-body { padding: 2rem 1rem 4rem; }
        }
      `}</style>

      {/* Header */}
      <div className="catering-header">
        <img src="/images/gatheringhub-logo.jpg" alt="The Gathering Hub" className="logo" />
        <p className="tagline">Everything served with care — buffet style, per person</p>
        <div className="header-rule"></div>
      </div>

      {/* Tabs */}
      <div className="tabs-wrapper">
        <div className="tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`tab-btn${activeTab === tab.id ? " active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── BREAKFAST ── */}
      {activeTab === "breakfast" && (
        <div className="menu-body">
          <div className="section-intro">
            <h2>Breakfast</h2>
            <span className="ornament">— ✦ —</span>
            <p className="sub">Priced per person · served buffet style<br />Coffee, hot tea &amp; water always included</p>
          </div>
          <div className="menu-group">
            {[
              { name: "Great Start", price: "$8", desc: "Assorted muffins, fresh fruit and assorted breakfast bars with two juice options." },
              { name: "Grab & Go", price: "$9", desc: "Assorted breakfast sandwiches and burritos — English muffin, biscuit or bagel with egg, cheese and sausage or bacon. Burritos with egg, cheese, sausage, onion and green pepper in a flour tortilla. Includes fresh whole fruit and two juice options." },
              { name: "Breakfast Classic", price: "$12", desc: "Scrambled eggs (with or without vegetables), bacon, sausage, American fries, biscuits with two juice options." },
              { name: "Big Breakfast", price: "$15", desc: "Choice of biscuits with sausage gravy or French toast bake, scrambled eggs, bacon, sausage, American fries, fresh fruit and two juice options. Min. 25 people." },
            ].map((item, i) => (
              <div key={i} className="menu-item">
                <div>
                  <div className="item-name">{item.name}</div>
                  <div className="item-desc">{item.desc}</div>
                </div>
                <div className="item-price">{item.price}</div>
              </div>
            ))}
          </div>
          <div className="options-block">
            <div className="opt-label">Juice Options</div>
            <p>Apple · Orange · Cranberry · Pineapple · Grape</p>
          </div>
        </div>
      )}

      {/* ── APPETIZERS ── */}
      {activeTab === "appetizers" && (
        <div className="menu-body">
          <div className="section-intro">
            <h2>Appetizers</h2>
            <span className="ornament">— ✦ —</span>
            <p className="sub">Priced per person · served buffet style</p>
          </div>
          <div className="menu-group">
            <div className="group-title">Savory &amp; Shareable</div>
            {[
              { name: "Cheese & Cracker Tray", price: "$3", desc: "Assortment of cheese, sliced perfectly for your cracker. Add ham, turkey or salami for $1 each." },
              { name: "Vegetable Tray with Dip", price: "$3", desc: "Cucumber, carrots, celery, broccoli and cauliflower with ranch or dill dip." },
              { name: "Vegetable Pizza", price: "$3", desc: "Fluffy baked crescent roll with ranch or dill dressing, cheddar cheese and fresh vegetables." },
              { name: "Chips & Salsa", price: "$2", desc: "Crispy tortilla chips with mild or medium salsa." },
              { name: "Pretzels with Mustard", price: "$2", desc: "Crispy pretzel knots with honey mustard for dipping." },
              { name: "Soft Pretzels", price: "$3", desc: "" },
            ].map((item, i) => (
              <div key={i} className="menu-item">
                <div>
                  <div className="item-name">{item.name}</div>
                  {item.desc && <div className="item-desc">{item.desc}</div>}
                </div>
                <div className="item-price">{item.price}</div>
              </div>
            ))}
          </div>
          <div className="menu-group">
            <div className="group-title">Sweet &amp; Snackable</div>
            {[
              { name: "Fresh Fruit Tray", price: "$2", desc: "Fresh grapes, melon, strawberries and pineapple." },
              { name: "Savory & Crunchy Snacks", price: "$2", desc: "Your choice of Chex Mix or Gardetto's." },
              { name: "Popcorn", price: "$2", desc: "Freshly popped with light butter and salt." },
              { name: "Sweet & Salty Trail Mix", price: "$3", desc: "Lightly salted nuts, salted candies and raisins." },
            ].map((item, i) => (
              <div key={i} className="menu-item">
                <div>
                  <div className="item-name">{item.name}</div>
                  <div className="item-desc">{item.desc}</div>
                </div>
                <div className="item-price">{item.price}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── LUNCH & DINNER ── */}
      {activeTab === "lunch" && (
        <div className="menu-body">
          <div className="section-intro">
            <h2>Lunch &amp; Dinner</h2>
            <span className="ornament">— ✦ —</span>
            <p className="sub">Priced per person · served buffet style<br />Coffee, hot tea &amp; water always included</p>
          </div>
          <div className="menu-group">
            {[
              { name: "Baked Potato Bar", price: "$13", desc: "Large baked russet potatoes with chili, cheese, sour cream, steamed broccoli, butter, bacon pieces and dessert." },
              { name: "Quick Lunch", price: "$14", desc: "Assorted sandwiches (ham, turkey or chicken salad) with chips and dessert. Choice of 6\" hoagie bun or large croissant; condiments on the side." },
              { name: "Just Salad", price: "$14", desc: "Choice of salad, dinner roll and dessert." },
              { name: "Soup & Sandwich", price: "$15", desc: "Assorted sandwiches with choice of 3\" hoagie bun or croissant, choice of soup and dessert; condiments on the side." },
              { name: "Pasta Favs", price: "$16", desc: "Choice of Chicken Alfredo, Mostaccioli (Sausage or Beef), Chicken Carbonara, or Lasagna with garlic bread sticks. Caesar salad and dessert." },
              { name: "Mexican Favs", price: "$17", desc: "Choice of tacos (flour tortillas) or enchiladas (beef or chicken), nacho chips, refried beans, Spanish rice, cheese, lettuce, tomato, sour cream and salsa. Dessert included." },
              { name: "Build Your Own — 1 Meat", price: "$17", desc: "Choice of one meat entrée, two sides, dinner roll and dessert." },
              { name: "Build Your Own — 2 Meats", price: "$20", desc: "Choice of two meat entrées, three sides, dinner roll and dessert. Min. 25 people." },
            ].map((item, i) => (
              <div key={i} className="menu-item">
                <div>
                  <div className="item-name">{item.name}</div>
                  <div className="item-desc">{item.desc}</div>
                </div>
                <div className="item-price">{item.price}</div>
              </div>
            ))}
          </div>
          {[
            { label: "Soup Options", text: "Loaded Baked Potato · Chicken Noodle · Vegetable Beef · Chicken Tortilla · Cheesy Broccoli & Ham · Chili · White Chicken Chili. Served with crackers, tortilla chips or cornbread." },
            { label: "Salad Options", text: "Chef (ham or turkey) · Beef or Chicken Taco · Spinach Chicken with Fruit · Chicken Caesar · Vegetable only. All salads include a variety of vegetables, croutons or tortilla chips, and choice of two dressings." },
            { label: "Meat Entrée Options", text: "Meatballs (beef gravy, mushroom or BBQ sauce) · Sliced Ham · Boneless Skinless Chicken Breast w/ Chicken Cheese Sauce · BBQ Pork · Vegetable Lasagna" },
            { label: "Side Options", text: "Mac & Cheese · Steamed Mixed Vegetables · Potato Salad · Corn · Baked Potatoes · Green Beans · Garlic Parmesan Redskin Potatoes · Baked Beans · Macaroni Salad (Tuna) · Italian Pasta Salad · Carrots" },
            { label: "Dessert Options", text: "Cookies: Chocolate Chip · Oatmeal Cranberry w/ White Chocolate Chip · Oatmeal Raisin · Peanut Butter. Brownies: With or without frosting. Cookie & brownie assortment allows three options." },
          ].map((opt, i) => (
            <div key={i} className="options-block">
              <div className="opt-label">{opt.label}</div>
              <p>{opt.text}</p>
            </div>
          ))}
          <div className="menu-group" style={{ marginTop: "2rem" }}>
            <div className="group-title">Add-On</div>
            <div className="menu-item simple">
              <div className="item-name">Cinnamon Honey Butter</div>
              <div className="item-price">$7.50/lb</div>
            </div>
          </div>
        </div>
      )}

      {/* ── DESSERTS ── */}
      {activeTab === "desserts" && (
        <div className="menu-body">
          <div className="section-intro">
            <h2>Desserts</h2>
            <span className="ornament">— ✦ —</span>
            <p className="sub">Priced per person · served buffet style</p>
          </div>
          <div className="menu-group">
            <div className="group-title">By the Slice</div>
            {[
              { name: "Sheet Cakes", price: "$3", desc: "Chocolate · Peanut Butter · Banana · Carrot" },
              { name: "Slab Pie", price: "$3", desc: "Apple Crumb · Cherry · Mixed Berry · Pecan · Chocolate Cream · Banana Cream · Coconut Cream" },
              { name: "Cheesecake", price: "$3", desc: "Plain with fruit topping — Cherry · Mixed Berry · Strawberry · Blueberry" },
              { name: "Vanilla Ice Cream", price: "$20", desc: "Approximately 28 servings per container." },
            ].map((item, i) => (
              <div key={i} className="menu-item">
                <div>
                  <div className="item-name">{item.name}</div>
                  <div className="item-desc">{item.desc}</div>
                </div>
                <div className="item-price">{item.price}</div>
              </div>
            ))}
          </div>
          <div className="menu-group">
            <div className="group-title">Celebration Cakes</div>
            <p style={{ fontStyle: "italic", color: "var(--muted)", fontSize: "0.9rem", marginBottom: "1rem", lineHeight: 1.6 }}>
              Decorated and personalized for your event. Cake flavors: Vanilla · Chocolate · Confetti · Red Velvet · Carrot · Lemon.
              Frosting: Vanilla Buttercream · Chocolate Buttercream · Cream Cheese.
            </p>
            <div className="item-name" style={{ marginBottom: "0.5rem" }}>Rectangle Cakes (2-layer)</div>
            <table className="size-table">
              <tbody>
                <tr><td>¼ Sheet — approx. 25 servings</td><td>$50</td></tr>
                <tr><td>½ Sheet — approx. 45 servings</td><td>$75</td></tr>
                <tr><td>Full Sheet — approx. 90 servings</td><td>$110</td></tr>
              </tbody>
            </table>
          </div>
          <div className="menu-group">
            <div className="group-title">By the Dozen</div>
            {[
              { name: "Cupcakes", price: "$22", desc: "Vanilla · Chocolate · Confetti · Red Velvet · Carrot · Lemon. Frosting: Vanilla Buttercream · Chocolate Buttercream · Cream Cheese." },
              { name: "Cutout Cookies", price: "$42", desc: "Decorated with royal icing and customized for your event." },
            ].map((item, i) => (
              <div key={i} className="menu-item">
                <div>
                  <div className="item-name">{item.name}</div>
                  <div className="item-desc">{item.desc}</div>
                </div>
                <div className="item-price">{item.price}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── DRINKS ── */}
      {activeTab === "drinks" && (
        <div className="menu-body">
          <div className="section-intro">
            <h2>Drinks</h2>
            <span className="ornament">— ✦ —</span>
          </div>
          <div className="drink-cat-title">Signature Drinks</div>
          <br />
          {[
            { name: "The Eleanor", price: "$6", desc: "Vodka, grenadine & Sprite or cranberry juice. Sweet with the perfect amount of sassy." },
            { name: "The Waylon", price: "$6", desc: "Coke with your choice of rum or whiskey. Soothing with strength." },
          ].map((item, i) => (
            <div key={i} className="menu-item">
              <div>
                <div className="item-name">{item.name}</div>
                <div className="item-desc">{item.desc}</div>
              </div>
              <div className="item-price">{item.price}</div>
            </div>
          ))}
          <hr className="drink-rule" />
          <div className="drink-cat-title">Bourbons</div>
          <div className="drink-cat-sub">On the rocks</div>
          <div className="drink-cat-price">$8</div>
          <hr className="drink-rule" />
          <div className="drink-cat-title">Beers</div>
          <div className="drink-cat-sub">Per bottle</div>
          <div className="drink-cat-price">$3</div>
          <hr className="drink-rule" />
          <div className="drink-cat-title">Wines</div>
          <div className="drink-cat-sub">Per glass</div>
          <div className="drink-cat-price">$6</div>
          <hr className="drink-rule" />
          <div className="drink-cat-title">Pop &amp; Water</div>
          <br />
          <div className="menu-item simple">
            <div className="item-name">Coke · Diet Coke · Sprite</div>
            <div className="item-price">$1</div>
          </div>
          <div className="menu-item simple">
            <div className="item-name">Bottled Water</div>
            <div className="item-price">$1</div>
          </div>
        </div>
      )}

      <footer className="catering-footer">
        The Gathering Hub · 121 S Pine River St, Ithaca, MI 48847 · (989) 400-2175
      </footer>
    </>
  );
}
