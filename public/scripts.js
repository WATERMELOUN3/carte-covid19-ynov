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

const data = await d3.csv("files/unemployment201907.csv");
const color = d3.scaleQuantize([1, 7], d3.schemeBlues[6]);
const path = d3.geoPath();
const format = d => `${d}%`;
const us = await d3.json("files/states-albers-10m.json");

console.log(data);

function drawMap() {
    const svg = d3.select("body").append("svg")
        .attr("viewBox", [0, 0, 975, 610]);

    svg.append("g")
        .attr("transform", "translate(610,20)")
        .append(() => legend({ color, title: "test 3", width: 260 }));

    svg.append("g")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.states).features)
        .join("path")
        .attr("fill", d => color(data.find((o) => o.name === d.properties.name).rate))
        .attr("d", path)
        .append("title")
        .text(d => `${d.properties.name}
${format(data.find((o) => o.name === d.properties.name).rate)}`);

    svg.append("path")
        .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-linejoin", "round")
        .attr("d", path);

    return svg.node;
}

drawMap();
