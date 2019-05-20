# d3-force-sampled

This module includes `d3.forceManyBodySampled()`, a faster version of the repulsive force algorithm in [d3-force](https://github.com/d3/d3-force). This module has zero dependencies. In practice, `d3.forceManyBodySampled()` can compute force-directed graph layouts 2.9 times faster on average than D3's `forceManyBody()`, which is based on the [Barnes–Hut approximation](https://en.wikipedia.org/wiki/Barnes–Hut_simulation). It can achieve this without a decrease in [graph readability metrics](https://github.com/rpgove/greadability) for the resulting graph layout.

This module uses the Random Vertex Sampling (RVS) algorithm. The Barnes-Hut approximation and Fast Multipole Method both use a spatial tree to compute approximate forces on each vertex, or node, in the graph. This means they run in O(|V| log(|V|)) time and require O(|V| log(|V|)) space for a graph with |V| vertices. In contrast, RVS runs in O(|V|) time and requires O(|V|^(3/4)) auxiliary space, or O(|V|) space overall. For specifics of the algorithm, see the [research paper](https://osf.io/2vpe4/).

If you use this module, please cite the following research paper:

Robert Gove. "A Random Sampling O(n) Force-calculation Algorithm for Graph Layouts." Computer Graphics Forum 38, 3 (2019). [Preprint PDF.](https://osf.io/2vpe4/)

## Credit

This module heavily uses code from [d3-force](https://github.com/d3/d3-force). Many thanks to Mike Bostock for making this resource available open source!

## Installing

If you use NPM, `npm install d3-force-sampled`. Otherwise, download the [latest release](https://github.com/twosixlabs/d3-force-sampled/releases/latest). AMD, CommonJS, and vanilla environments are supported.

## Usage

`d3.forceManyBodySampled()` extends the `d3.forceManyBody()` API, and therefore can be used as a drop-in replacement for `d3.forceManyBody()`. The following is a simple example:

```html
<script src="https://d3js.org/d3.v5.min.js"></script>
<script src="d3-force-sampled.js"></script>
<script>

var simulation = d3.forceSimulation(nodes)
  .velocityDecay(0.2)
  .force("link", d3.forceLink().id(function(d) { return d.id; }))
  .force("charge", d3.forceManyBodySampled());

</script>
```

In particular, it is recommended to use `.velocityDecay(0.2)` when using `d3.forceManyBodySampled()`. This helps it produce results more similar to `d3.forceManyBody()`.

For full usage examples, see the [simple example of d3-force-sampled](), the [d3-force-sampled speed comparison](), or [composing multiple forces and constraints with d3-force-sampled]():

[<img alt="Simple d3-force-sampled Example" src="https://raw.githubusercontent.com/twosixlabs/d3-force-sampled/master/img/d3-force-sampled-example.png" width="480" height="239">](http://bl.ocks.org/rpgove/14bf7407d66cd364ce399ea0540e67b9)[<img alt="d3-force-sampled Speed Comparison" src="https://raw.githubusercontent.com/twosixlabs/d3-force-sampled/master/img/sampled-vs-bh.png" width="480" height="239">](http://bl.ocks.org/rpgove/28345b65a65753ecbabc3acbe30c3d70)[<img alt="Composing multiple forces and constraints with Random Vertex Sampling" src="https://raw.githubusercontent.com/twosixlabs/d3-force-sampled/master/img/d3-force-sampled-composed.png" width="480" height="239">](http://bl.ocks.org/rpgove/2c523eb97f594de8ae0d04e305495c72)

## API Reference

### Many-Body Random Vertex Sampling

The many-body (or *n*-body) force applies mutually amongst all [nodes](#simulation_nodes). It can be used to simulate gravity (attraction) if the [strength](#manyBodySampled_strength) is positive, or electrostatic charge (repulsion) if the strength is negative. This implementation uses [Random Vertex Sampling](https://osf.io/2vpe4/) to greatly improve runtime performance; the accuracy can be customized using the [updateSize](#manyBodySampled_updateSize), [sampleSize](#manyBodySampled_sampleSize), and [neighborSize](#manyBodySampled_neighborSize) parameters. The *updateSize* determines the number of nodes that are chosen to have new repulsive forces calculated on them during this iteration. The *sampleSize* determines the number of randomly nodes chosen to compute forces on a node that is being updated. The *neighborSize* is used to create a list of (approximate) nearest neighbors for each node that is used to calculate repulsive forces, even for nodes not chosen by the *updateSize* parameter.

Unlike links, which only affect two linked nodes, the charge force is global: every node can affect every other node, even if they are on disconnected subgraphs.

<a name="forceManyBodySampled" href="#forceManyBodySampled">#</a> d3.<b>forceManyBodySampled</b>() [<>](https://github.com/twosixlabs/d3-force-sampled/blob/master/src/manyBodySampled.js "Source")

Creates a new many-body force with the default parameters.

<a name="manyBodySampled_updateSize" href="#manyBodySampled_updateSize">#</a> <i>manyBodySampled</i>.<b>updateSize</b>([<i>updateSize</i>]) [<>](https://github.com/twosixlabs/d3-force-sampled/blob/master/src/manyBodySampled.js#L207 "Source")

If *updateSize* is specified, sets the *updateSize* accessor to the specified number or function, re-evaluates the update size accessor, and returns this force. If the update size is a number, it must be a non-negative integer; other numbers will be rounded up to the nearest non-negative integer. If the update size is a function, it will be passed the *nodes* array and must return an integer. The resulting number is then stored internally, such that the update size is only recomputed when the force is initialized or when this method is called with a new *updateSize*, and not on every application of the force. If *updateSize* is not specified, returns the current update size accessor, which defaults to:

```js
function (nodes) {
  return Math.pow(nodes.length, 0.75);
}
```

The update size determines the number of nodes that are chosen to be updated at each iteration. If a node is chosen to be updated, then *[sampleSize](#manyBodySampled_sampleSize)* nodes are randomly chosen to compute repulsive forces on it. If *updateSize* * *sampleSize* equals the number of nodes, then the algorithm will run in linear time. Using a larger *updateSize* or *sampleSize* will make the algorithm slower but more accurate. Note that this is different from the neighbor repulsive forces calculated using *[neighborSize](#manyBodySampled_neighborSize)*, which are calculated at every iteration.

<a name="manyBodySampled_sampleSize" href="#manyBodySampled_sampleSize">#</a> <i>manyBodySampled</i>.<b>sampleSize</b>([<i>sampleSize</i>]) [<>](https://github.com/twosixlabs/d3-force-sampled/blob/master/src/manyBodySampled.js#L211 "Source")

If *sampleSize* is specified, sets the *sampleSize* accessor to the specified number or function, re-evaluates the sample size accessor, and returns this force. If the sample size is a number, it must be a non-negative integer; non-integer numbers will be rounded up to the nearest non-negative integer. If the sample size is a function, it will be passed the *nodes* array and must return an integer. The resulting number is then stored internally, such that the sample size is only recomputed when the force is initialized or when this method is called with a new *sampleSize*, and not on every application of the force. If *sampleSize* is not specified, returns the current sample size accessor, which defaults to:

```js
function (nodes) {
  return Math.pow(nodes.length, 0.25);
}
```

The sample size determines the number of nodes that are chosen to compute repulsive forces on each node chosen to be [updated](#manyBodySampled_sampleSize). If *updateSize* * *sampleSize* equals the number of nodes, then the algorithm will run in linear time. Using a larger *updateSize* or *sampleSize* will make the algorithm slower but more accurate. Note that this is different from the neighbor repulsive forces calculated using *[neighborSize](#manyBodySampled_neighborSize)*, which are calculated at every iteration.

<a name="manyBodySampled_neighborSize" href="#manyBodySampled_neighborSize">#</a> <i>manyBodySampled</i>.<b>neighborSize</b>([<i>neighborSize</i>]) [<>](https://github.com/twosixlabs/d3-force-sampled/blob/master/src/manyBodySampled.js#L203 "Source")

If *neighborSize* is specified, sets the *neighborSize* accessor to the specified number or function, re-evaluates the neighbor size accessor, and returns this force. If the neighbor size is a number, it must be a non-negative integer; non-integer numbers will be rounded up to the nearest non-negative integer. If the neighbor size is a function, it will be passed the *nodes* array and must return an integer. The resulting number is then stored internally, such that the neighbor size is only recomputed when the force is initialized or when this method is called with a new *neighborSize*, and not on every application of the force. If *neighborSize* is not specified, returns the current neighbor size accessor, which defaults to:

```js
function (nodes) {
  return 15;
}
```

Each node *n* maintains a list of "neighbor" nodes with exactly *neighborSize* nodes. These neighbors are initially chosen randomly. During each iteration, the algorithm updates the node *n*'s list of neighbors by randomly choosing a new node. If the new node is closer to *n* than at least one of the current nodes in the neighbor list, then the new node replaces the most distant node. Subsequently, *n*'s neighbors are used to compute repulsive forces on *n*, scaled by 
a [charge multiplier](#manyBodySampled_chargeMultiplier).

<a name="manyBodySampled_chargeMultiplier" href="#manyBodySampled_chargeMultiplier">#</a> <i>manyBodySampled</i>.<b>chargeMultiplier</b>([<i>chargeMultiplier</i>]) [<>](https://github.com/twosixlabs/d3-force-sampled/blob/master/src/manyBodySampled.js#L215 "Source")

If *chargeMultiplier* is specified, sets the *chargeMultiplier* accessor to the specified number or function, re-evaluates the neighbor size accessor, and returns this force. If the charge multiplier is a function, it will be passed the *nodes* array and must return an integer. The resulting number is then stored internally, such that the charge multiplier is only recomputed when the force is initialized or when this method is called with a new *chargeMultiplier*, and not on every application of the force. If *chargeMultiplier* is not specified, returns the current neighbor size accessor, which defaults to:

```js
function (nodes) {
  return return nodes.length < 100 ? 1 : nodes.length < 200 ? 3 : Math.sqrt(nodes.length);
}
```

The charge multiplier has the effect of scaling the repulsive forces for the nodes that are chosen to update their repulsive forces, as well as the neighbors of each node. This is useful because otherwise the small number of nodes used to compute repulsive forces might not be enough to sufficiently push apart nodes.

<a name="manyBodySampled_source" href="#manyBodySampled_source">#</a> <i>manyBodySampled</i>.<b>source</b>([<i>source</i>]) [<>](https://github.com/twosixlabs/d3-force-sampled/blob/master/src/manyBodySampled.js#L219 "Source")

Sets the random number generator used as the source of randomness instead of Math.random. The given random number generator must implement the same interface as Math.random and only return values in the range [0, 1). This is useful when a seeded random number generator is preferable to Math.random. For example:

```js
var manyBodySampled = require("d3-force-sampled"),
    seedrandom = require("seedrandom");

manyBodySampled.source(seedrandom("a22ebc7c488a3a47"));
```

<a name="manyBodySampled_strength" href="#manyBodySampled_strength">#</a> <i>manyBodySampled</i>.<b>strength</b>([<i>strength</i>]) [<>](https://github.com/twosixlabs/d3-force-sampled/blob/master/src/manyBodySampled.js#L191 "Source")

If *strength* is specified, sets the strength accessor to the specified number or function, re-evaluates the strength accessor for each node, and returns this force. A positive value causes nodes to attract each other, similar to gravity, while a negative value causes nodes to repel each other, similar to electrostatic charge. If *strength* is not specified, returns the current strength accessor, which defaults to:

```js
function strength() {
  return -30;
}
```

The strength accessor is invoked for each node in the simulation, being passed the *node* and its zero-based *index*. The resulting number is then stored internally, such that the strength of each node is only recomputed when the force is initialized or when this method is called with a new *strength*, and not on every application of the force.

<a name="manyBodySampled_distanceMin" href="#manyBodySampled_distanceMin">#</a> <i>manyBodySampled</i>.<b>distanceMin</b>([<i>distance</i>]) [<>](https://github.com/twosixlabs/d3-force-sampled/blob/master/src/manyBodySampled.js#L195 "Source")

If *distance* is specified, sets the minimum distance between nodes over which this force is considered. If *distance* is not specified, returns the current minimum distance, which defaults to 1. A minimum distance establishes an upper bound on the strength of the force between two nearby nodes, avoiding instability. In particular, it avoids an infinitely-strong force if two nodes are exactly coincident; in this case, the direction of the force is random.

<a name="manyBodySampled_distanceMax" href="#manyBodySampled_distanceMax">#</a> <i>manyBodySampled</i>.<b>distanceMax</b>([<i>distance</i>]) [<>](https://github.com/twosixlabs/d3-force-sampled/blob/master/src/manyBodySampled.js#L199 "Source")

If *distance* is specified, sets the maximum distance between nodes over which this force is considered. If *distance* is not specified, returns the current maximum distance, which defaults to infinity. Specifying a finite maximum distance improves performance and produces a more localized layout.