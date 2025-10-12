const params = new URLSearchParams(window.location.search);
const articleId = parseInt(params.get("Article"), 10);

fetch("Articles/article.json")
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById("article-container");
    const article = data.find(a => a.Article === articleId);

    if (!article) {
      container.innerHTML = "<h2>Article not found</h2>";
      return;
    }

    container.innerHTML = `
      <h1>${article.title}</h1>
      <div class="article-values">
        <p>
          <i class="material-icons">calendar_month</i><span>${article.date}</span>
          <i class="material-icons">alarm</i> <span>${article.duration}</span>
          <i class="material-icons">person</i> By <span>${article.author}</span>
        </p>
      </div>
      <img src="${article.mainImage}" class="Main-img" alt="${article.title}" >
      ${article.attr}
    `;
    document.title = article.title + ' | Blazas';

    article.content.forEach(item => {
      let el;
      switch (item.type) {
        case "paragraph":
          el = document.createElement("div");
          el.classList.add("p-div");
          el.innerHTML = `<p>${item.text}</p>`;
          break;
        case "image":
          el = document.createElement("div");
          el.classList.add("image-div");
          el.innerHTML = `
          <div class="loader"></div>
            <img src="${item.url}" alt="${item.caption}" onload="this.style.display='block'; this.style.border='none'; this.previousElementSibling.style.display='none';">
            <p class="image-caption">${item.caption}</p>
            ${item.attr}
          `;
          break;
        case "heading":
          el = document.createElement("h2");
          el.className = "h2";
          el.textContent = "• "+" " + item.text;
          break;
        case "s-image":
          el = document.createElement("div");
          el.classList.add("s-image-div");
          el.innerHTML = `
            <div class="s-image">
              <img src="${item.url}" alt="${item.caption}">
              <p class="image-caption">${item.caption}</p>
              ${item.attr}
            </div>
            <p>${item.detail}</p>
          `;
          break;
        case "pullquote":
          el = document.createElement("blockquote");
          el.className = "pull-quote";
          el.textContent = item.text;
          break;

          /*
          template for json data for table

          {
         "type":"table",
         "values":{
          "headers":["No","Distance","Speed"],
           "rows": [
           ["Mercury", "0.39", "0"],
           ["Venus", "0.72", "0"],
           ["Earth", "1.00", "1"],
           ["Mars", "1.52", "2"]
       ]
      }
      },
      */



        case "table":
          el = document.createElement("div");
          el.classList.add("table-container");

          let tableHTML = `<table>`;
          if (item.values.headers && item.values.headers.length > 0) {
            tableHTML += "<thead><tr>";
            item.values.headers.forEach(header => {
              tableHTML += `<th>${header}</th>`;
            });
            tableHTML += "</tr></thead>";
          }

          if (item.values.rows && item.values.rows.length > 0) {
            tableHTML += "<tbody>";
            item.values.rows.forEach(row => {
              tableHTML += "<tr>";
              row.forEach(cell => {
                tableHTML += `<td>${cell}</td>`;
              });
              tableHTML += "</tr>";
            });
            tableHTML += "</tbody>";
          }

          tableHTML += "</table>";
          el.innerHTML = tableHTML;
          break;


        default:
          el = document.createElement("div");
      }
      container.appendChild(el);
    });

    // 🔹 Inject schema dynamically
    injectSchema(article);

  })
  .catch(err => {
    document.getElementById("article-container").innerHTML =
      "<h2>Error loading article</h2>";
    console.error(err);
  });

// 🔹 Schema function
function injectSchema(article) {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": (article.detail || article.content?.[0]?.text || "").slice(0, 160),
    "image": article.mainImage,
    "author": { "@type": "Person", "name": article.author || "Unknown" },
    "publisher": {
      "@type": "Organization",
      "name": "Blazas",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.blazas.com/img/logo.svg"
      }
    },
    "datePublished": article.date,
    "dateModified": article.date,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": window.location.href
    }
  };

  let schemaEl = document.getElementById("article-schema");
  if (!schemaEl) {
    schemaEl = document.createElement("script");
    schemaEl.id = "article-schema";
    schemaEl.type = "application/ld+json";
    document.head.appendChild(schemaEl);
  }
  schemaEl.textContent = JSON.stringify(schemaData, null, 2);
}
