tnt.tree.label = function () {
"use strict";

    // TODO: Not sure if we should be removing by default prev labels
    // or it would be better to have a separate remove method called by the vis
    // on update
    // We also have the problem that we may be transitioning from
    // text to img labels and we need to remove the label of a different type
    var label = function (node, layout_type) {
	if (typeof (node) !== 'function') {
            throw(node);
        }

	label.display().call(this, node, layout_type)
	    .attr("class", "tnt_tree_label")
	    .attr("transform", function (d) {
		var t = label.transform()(node, layout_type);
		return "translate (" + t.translate[0] + " " + t.translate[1] + ")rotate(" + t.rotate + ")";
	    })
	    .on("click", function(){
		if (label.on_click() !== undefined) {
		    d3.event.stopPropagation();
		    label.on_click().call(this, node);
		}
	    });

    };

    var api = tnt.utils.api (label)
	.getset ('width', function () { throw "Need a width callback" })
	.getset ('height', function () { throw "Need a height callback" })
	.getset ('display', function () { throw "Need a display callback" })
	.getset ('transform', function () { throw "Need a transform callback" })
	.getset ('on_click');

    api.method ('remove', function () {
	d3.select(this)
	    .selectAll(".tnt_tree_label")
	    .remove();
    });

    return label;
};

// Text based labels
tnt.tree.label.text = function () {
    var label = tnt.tree.label();

    var api = tnt.utils.api (label)
	.getset ('fontsize', 10)
	.getset ('color', "#000")
	.getset ('text', function (d) {
	    return d.data().name;
	})

    label.display (function (node, layout_type) {
	var l = d3.select(this)
	    .append("text")
	    .attr("text-anchor", function (d) {
		if (layout_type === "radial") {
		    return (d.x%360 < 180) ? "start" : "end";
		}
		return "start";
	    })
	    .text(function(){
		return label.text()(node)
	    })
	    .style('font-size', label.fontsize() + "px")
	    .style('fill', d3.functor(label.color())(node));

	return l;
    });

    label.transform (function (node, layout_type) {
	var d = node.data();
	var t = {
	    translate : [10, 5],
	    rotate : 0
	};
	if (layout_type === "radial") {
	    t.translate[1] = t.translate[1] - (d.x%360 < 180 ? 0 : label.fontsize())
	    t.rotate = (d.x%360 < 180 ? 0 : 180)
	}
	return t;
    });


    // label.transform (function (node) {
    // 	var d = node.data();
    // 	return "translate(10 5)rotate(" + (d.x%360 < 180 ? 0 : 180) + ")";
    // });

    label.width (function (node) {
	var svg = d3.select("body")
	    .append("svg")
	    .attr("height", 0)
	    .style('visibility', 'hidden');

	var text = svg
	    .append("text")
	    .style('font-size', label.fontsize() + "px")
	    .text(label.text()(node));

	var width = text.node().getBBox().width;
	svg.remove();

	return width;
    });

    label.height (function (node) {
	return label.fontsize();
    });

    return label;
};

// Image based labels
tnt.tree.label.img = function () {
    var label = tnt.tree.label();

    var api = tnt.utils.api (label)
	.getset ('src', function () {})

    label.display (function (node, layout_type) {
	if (label.src()(node)) {
	    var l = d3.select(this)
		.append("image")
		.attr("width", label.width()())
		.attr("height", label.height()())
		.attr("xlink:href", label.src()(node));
	    return l;
	}
	// fallback text in case the img is not found?
	return d3.select(this)
	    .append("text")
	    .text("");
    });

    label.transform (function (node, layout_type) {
	var d = node.data();
	var t = {
	    translate : [10, (-label.height()() / 2)],
	    rotate : 0
	};
	if (layout_type === 'radial') {
	    t.translate[0] = t.translate[0] + (d.x%360 < 180 ? 0 : label.width()()),
	    t.translate[1] = t.translate[1] + (d.x%360 < 180 ? 0 : label.height()()),
	    t.rotate = (d.x%360 < 180 ? 0 : 180)
	}

	return t;
    });

    return label;
};

// Labels made of 2+ simple labels
tnt.tree.label.composite = function () {

    var labels = [];

    var label = function (node, layout_type) {
	for (var i=0; i<labels.length; i++) {
	    labels[i].call(this, node, layout_type);
	}
    };

    var api = tnt.utils.api (label)

    api.method ('add_label', function (display) {
	var curr_labels = [];
	for (var i=0; i<labels.length; i++) {
	    curr_labels.push(labels[i]);
	}

	display._super_ = {};
	tnt.utils.api (display._super_)
	    .get ('transform', display.transform());

	display.transform( function (node, layout_type) {
	    var curr_offset = 0;
	    var d = node.data();
	    for (var i=0; i<curr_labels.length; i++) {
		curr_offset += curr_labels[i].width()(node);
		if ((layout_type === 'radial') && (d.x%360 > 180)) {
		    curr_offset += 10
		} else {
		    curr_offset += curr_labels[i].transform()(node, layout_type).translate[0];
		}
	    }

	    var tsuper = display._super_.transform()(node, layout_type);
	    var t = {
		translate : [curr_offset + tsuper.translate[0], tsuper.translate[1]],
		rotate : tsuper.rotate
	    }
	    return t;
	});

	labels.push(display);
	return label;
    });

    api.method ('width', function () {
	return function (node) {
	    var tot_width = 0;
	    for (var i=0; i<labels.length; i++) {
		tot_width += parseInt(labels[i].width()(node));
		tot_width += parseInt(labels[i]._super_.transform()(node).translate[0]);
	    }

	    return tot_width;
	}
    });

    api.method ('height', function () {
	return function (node) {
	    var max_height = 0;
	    for (var i=0; i<labels.length; i++) {
		var curr_height = labels[i].height()(node);
		if ( curr_height > max_height) {
		    max_height = curr_height;
		}
	    }
	    return max_height;
	}
    });

    api.method ('remove', function (node) {
	for (var i=0; i<labels.length; i++) {
	    labels[i].remove.call(this, node);
	}
    });

    return label;
};
