import constant from "./constant.js";

function index(d) {
  return d.index;
}

function find(nodeById, nodeId) {
  var node = nodeById.get(nodeId);
  if (!node) throw new Error("missing: " + nodeId);
  return node;
}

export default function(links) {
  var id = index,
      prevIndex = 0,
      strength = defaultStrength,
      strengths,
      distance = constant(30),
      distances,
      updateSize = function (_, nodes, links) { return !links ? 0 : 0.5 * links.length; },
      updateMultiplier = constant(2),
      nodes,
      count,
      bias,
      iterations = 1,
      rand = Math.random;

  if (links == null) links = [];

  function defaultStrength(link) {
    return 1 / Math.min(count[link.source.index], count[link.target.index]);
  }

  function force(alpha) {
    var numUpdate = Math.ceil(updateSize(alpha, nodes, links)),
        multiplier = updateMultiplier(alpha, nodes, links),
        upperIndex = prevIndex + numUpdate;

    for (var k = 0, n = links.length; k < iterations; ++k) {
      for (var i = prevIndex, currIndex = prevIndex, link, source, target, x, y, l, b; i < upperIndex; ++i, currIndex = i%n) {
        link = links[currIndex], source = link.source, target = link.target;
        x = target.x + target.vx - source.x - source.vx || (rand() - 0.5) * 1e-6;
        y = target.y + target.vy - source.y - source.vy || (rand() - 0.5) * 1e-6;
        l = Math.sqrt(x * x + y * y);
        l = (l - distances[currIndex]) / l * alpha * strengths[currIndex] * multiplier;
        x *= l, y *= l;
        target.vx -= x * (b = bias[currIndex]);
        target.vy -= y * b;
        source.vx += x * (b = 1 - b);
        source.vy += y * b;
      }
    }

    if (n > 0)
      prevIndex = upperIndex % n;
  }

  function initialize() {
    if (!nodes) return;

    var i,
        n = nodes.length,
        m = links.length,
        nodeById = new Map(nodes.map(function (d, i) { return [id(d, i, nodes), d]})),
        link;

    for (i = 0, count = new Array(n); i < m; ++i) {
      link = links[i], link.index = i;
      if (typeof link.source !== "object") link.source = find(nodeById, link.source);
      if (typeof link.target !== "object") link.target = find(nodeById, link.target);
      count[link.source.index] = (count[link.source.index] || 0) + 1;
      count[link.target.index] = (count[link.target.index] || 0) + 1;
    }

    for (i = 0, bias = new Array(m); i < m; ++i) {
      link = links[i], bias[i] = count[link.source.index] / (count[link.source.index] + count[link.target.index]);
    }

    strengths = new Array(m), initializeStrength();
    distances = new Array(m), initializeDistance();
  }

  function initializeStrength() {
    if (!nodes) return;

    for (var i = 0, n = links.length; i < n; ++i) {
      strengths[i] = +strength(links[i], i, links);
    }
  }

  function initializeDistance() {
    if (!nodes) return;

    for (var i = 0, n = links.length; i < n; ++i) {
      distances[i] = +distance(links[i], i, links);
    }
  }

  force.initialize = function(_) {
    nodes = _;
    initialize();
  };

  force.links = function(_) {
    return arguments.length ? (links = _, initialize(), force) : links;
  };

  force.source = function(_) {
    return arguments.length ? (rand = _, force) : rand;
  };

  force.id = function(_) {
    return arguments.length ? (id = _, force) : id;
  };

  force.iterations = function(_) {
    return arguments.length ? (iterations = +_, force) : iterations;
  };

  force.strength = function(_) {
    return arguments.length ? (strength = typeof _ === "function" ? _ : constant(+_), initializeStrength(), force) : strength;
  };

  force.distance = function(_) {
    return arguments.length ? (distance = typeof _ === "function" ? _ : constant(+_), initializeDistance(), force) : distance;
  };

  force.updateSize = function(_) {
    return arguments.length ? (updateSize = typeof _ === "function" ? _ : constant(+_), force) : updateSize;
  };

  force.updateMultiplier = function(_) {
    return arguments.length ? (updateMultiplier = typeof _ === "function" ? _ : constant(+_), force) : updateMultiplier;
  };

  return force;
}