import * as d3_core from "./d3.min.js";
//import * as topojson from "https://unpkg.com/topojson@3.0.2";
//import * as topojson_client from "https://unpkg.com/topojson-client@2";

import * as d3_fetch from "https://cdn.skypack.dev/d3-fetch@3";
import * as d3_scale_chromatic from "https://cdn.skypack.dev/d3-scale-chromatic@3";
import * as d3_scale from "https://cdn.skypack.dev/d3-scale@4";
import * as d3_geo from "https://cdn.skypack.dev/d3-geo@3";
import * as d3_selection from "https://cdn.skypack.dev/d3-selection@3";
import * as d3_array from "https://cdn.skypack.dev/d3-array@3";
import * as d3_axis from "https://cdn.skypack.dev/d3-axis@3";

const d3 = {
    ...d3_core,
    ...d3_fetch,
    ...d3_scale,
    ...d3_scale_chromatic,
    ...d3_geo,
    ...d3_selection,
    ...d3_array,
    ...d3_axis
};

function Legend(color, {
    title,
    tickSize = 6,
    width = 320,
    height = 44 + tickSize,
    marginTop = 18,
    marginRight = 0,
    marginBottom = 16 + tickSize,
    marginLeft = 0,
    ticks = width / 64,
    tickFormat,
    tickValues
} = {}) {

    function ramp(color, n = 256) {
        const canvas = document.createElement("canvas");
        canvas.width = n;
        canvas.height = 1;
        const context = canvas.getContext("2d");
        for (let i = 0; i < n; ++i) {
            context.fillStyle = color(i / (n - 1));
            context.fillRect(i, 0, 1, 1);
        }
        return canvas;
    }

    const svg = d3.create("svg")
        .attr("id", "legend-svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .style("overflow", "visible")
        .style("display", "block");

    let tickAdjust = g => g.selectAll(".tick line").attr("y1", marginTop + marginBottom - height);
    let x;

    // Continuous
    if (color.interpolate) {
        const n = Math.min(color.domain().length, color.range().length);

        x = color.copy().rangeRound(d3.quantize(d3.interpolate(marginLeft, width - marginRight), n));

        svg.append("image")
            .attr("x", marginLeft)
            .attr("y", marginTop)
            .attr("width", width - marginLeft - marginRight)
            .attr("height", height - marginTop - marginBottom)
            .attr("preserveAspectRatio", "none")
            .attr("xlink:href", ramp(color.copy().domain(d3.quantize(d3.interpolate(0, 1), n))).toDataURL());
    }

    // Sequential
    else if (color.interpolator) {
        x = Object.assign(color.copy()
            .interpolator(d3.interpolateRound(marginLeft, width - marginRight)),
            { range() { return [marginLeft, width - marginRight]; } });

        svg.append("image")
            .attr("x", marginLeft)
            .attr("y", marginTop)
            .attr("width", width - marginLeft - marginRight)
            .attr("height", height - marginTop - marginBottom)
            .attr("preserveAspectRatio", "none")
            .attr("xlink:href", ramp(color.interpolator()).toDataURL());

        // scaleSequentialQuantile doesn’t implement ticks or tickFormat.
        if (!x.ticks) {
            if (tickValues === undefined) {
                const n = Math.round(ticks + 1);
                tickValues = d3.range(n).map(i => d3.quantile(color.domain(), i / (n - 1)));
            }
            if (typeof tickFormat !== "function") {
                tickFormat = d3.format(tickFormat === undefined ? ",f" : tickFormat);
            }
        }
    }

    // Threshold
    else if (color.invertExtent) {
        const thresholds
            = color.thresholds ? color.thresholds() // scaleQuantize
                : color.quantiles ? color.quantiles() // scaleQuantile
                    : color.domain(); // scaleThreshold

        const thresholdFormat
            = tickFormat === undefined ? d => d
                : typeof tickFormat === "string" ? d3.format(tickFormat)
                    : tickFormat;

        x = d3.scaleLinear()
            .domain([-1, color.range().length - 1])
            .rangeRound([marginLeft, width - marginRight]);

        svg.append("g")
            .selectAll("rect")
            .data(color.range())
            .join("rect")
            .attr("x", (d, i) => x(i - 1))
            .attr("y", marginTop)
            .attr("width", (d, i) => x(i) - x(i - 1))
            .attr("height", height - marginTop - marginBottom)
            .attr("fill", d => d);

        tickValues = d3.range(thresholds.length);
        tickFormat = i => thresholdFormat(thresholds[i], i);
    }

    // Ordinal
    else {
        x = d3.scaleBand()
            .domain(color.domain())
            .rangeRound([marginLeft, width - marginRight]);

        svg.append("g")
            .selectAll("rect")
            .data(color.domain())
            .join("rect")
            .attr("x", x)
            .attr("y", marginTop)
            .attr("width", Math.max(0, x.bandwidth() - 1))
            .attr("height", height - marginTop - marginBottom)
            .attr("fill", color);

        tickAdjust = () => { };
    }

    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(x)
            .ticks(ticks, typeof tickFormat === "string" ? tickFormat : undefined)
            .tickFormat(typeof tickFormat === "function" ? tickFormat : undefined)
            .tickSize(tickSize)
            .tickValues(tickValues))
        .call(tickAdjust)
        .call(g => g.select(".domain").remove())
        .call(g => g.append("text")
            .attr("x", marginLeft)
            .attr("y", marginTop + marginBottom - height - 6)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .attr("class", "title")
            .text(title));

    return svg.node();
}

function legend({ color, ...options }) {
    return Legend(color, options);
}

Date.prototype.toDateInputValue = (function () {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0, 10);
});

const departementsJson = await d3.json("files/departements_france.json");
const regionsJson = await d3.json("files/regions_france.json");

console.log(regionsJson);

function minAndMaxPos(data) {
    let min = Number.MAX_SAFE_INTEGER;
    let max = 0;
    data.forEach(e => {
        const val = e.pos;
        if (val < min) min = val;
        if (val > max) max = val;
    });
    return [min, max];
}

function clear() {
    d3.select('#map').select("#map-svg").remove();
}

function findDepOrReg(data, d) {
    if (d.properties.CODE_DEPT === undefined) {
        return data.find((o) => o.reg === parseInt(d.properties.code));
    } else {
        return data.find((o) => o.dep === parseInt(d.properties.CODE_DEPT))
    }
}

function drawMap(data, geojson) {
    clear();
    const minmax = minAndMaxPos(data);
    const color = d3.scaleLinear().domain(minmax).range(['white', 'red']);
    const width = 700, height = 700;
    const path = d3.geoPath();
    const projection = d3.geoConicConformal()
        .center([2.454071, 46.279229])
        .scale(3000)
        .translate([width / 2, height / 2]);

    path.projection(projection);

    const svg = d3.select('#map').append("svg")
        .attr("id", "map-svg")
        .attr("width", width)
        .attr("height", height);

    //svg.append(() => legend({ color, title: "Taux Covid", width: 260 }));

    svg.append("g").selectAll("path")
        .data(geojson.features)
        .enter()
        .append("path")
        .attr("fill", d => color(findDepOrReg(data, d).pos))
        .attr("d", path)
        .append("title")
        .text(d => `${d.properties.NOM_DEPT}\n${findDepOrReg(data, d).pos} cas en 24h\n${findDepOrReg(data, d).pos_7j} cas totaux sur 7j`)
}

function formattedDate(d = new Date) {
    let month = String(d.getMonth() + 1);
    let day = String(d.getDate() - 1);
    const year = String(d.getFullYear());

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return `${day}-${month}-${year}`;
}

function update() {
    const zone = document.getElementById("zone-select").value;
    const date = formattedDate(new Date(document.getElementById("date").value));
    const route = zone === "dep" ? "dataDepDate" : "dataRegDate";
    fetch(`api/${route}/${date}`).then((res) => {
        res.json().then((json) => {
            console.log(json);
            drawMap(json, zone === "dep" ? departementsJson : regionsJson);
        }).catch((err) => [

        ]);
    }).catch((err) => {

    });
}

function today() {
    if (!document.getElementById('date').value) document.getElementById('date').value = new Date().toDateInputValue();
    update();
}

document.getElementById("update").addEventListener("click", update, false);
document.getElementById("today").addEventListener("click", today, false);
today();