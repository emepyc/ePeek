epeek.tree = function () {
 "use strict";

    var conf = {
	duration         : 500,      // Duration of the transitions
	label            : epeek.tree.label.text(),
	layout           : epeek.tree.layout.vertical(),
	node_info        : function () {},
	node_dbl_info    : function () {},
	link_color       : 'steelblue',
	node_color       : 'steelblue',
	node_circle_size : 4.5,
    };

    // Extra delay in the transitions (TODO: Needed?)
    var delay = 0;

    // Ease of the transitions
    var ease = "cubic-in-out";

    // If labels should be skipped
    // TODO: Replace this with a valid epeek.tree.label that does nothing
    // var skip_labels = false;

    // TODO: Don't know if this is useful or not
    // Probably this can go and see if this can be set with the API
    var curr_species = "Homo_sapiens";

    // By node data
    var sp_counts = {};
 
    var scale = false;

    // The id of the tree container
    var div_id;

    // The tree visualization (svg)
    var svg;
    var vis;

    // TODO: For now, counts are given only for leaves
    // but it may be good to allow counts for internal nodes
    var counts = {};

    // The full tree
    var base = {
	tree : undefined,
	data : undefined,	
	nodes : undefined,
	links : undefined
    };

    // The curr tree. Needed to re-compute the links / nodes positions of subtrees
    var curr = {
	tree : undefined,
	data : undefined,
	nodes : undefined,
	links : undefined
    };

    // The cbak returned
    var tree = function (div) {
	div_id = d3.select(div).attr("id");

        var tree_div = d3.select(div)
            .append("div")
	    .attr("class", "ePeek_groupDiv");

	var cluster = conf.layout.cluster;

	var n_leaves = curr.tree.get_all_leaves().length;

	var max_leaf_label_length = function (tree) {
	    var max = 0;
	    var leaves = tree.get_all_leaves();
	    for (var i=0; i<leaves.length; i++) {
		var label_width = conf.label.width()(leaves[i].data());
		if (label_width > max) {
		    max = label_width;
		}
	    }
	    return max;
	};


	var max_label_length = max_leaf_label_length(curr.tree);
	conf.layout.max_leaf_label_width(max_label_length);

	// Cluster size is the result of...
	// total width of the vis - transform for the tree - max_leaf_label_width - horizontal transform of the label
	// TODO: Substitute 15 by the horizontal transform of the nodes
	var cluster_size_params = {
	    n_leaves : n_leaves,
	    label_height : d3.functor(conf.label.height())(),
	    label_padding : 15
	};

// 	cluster.size([n_leaves * conf.label.height()(),
// 		      (conf.layout.width() - conf.layout.max_leaf_label_width() - conf.layout.translate_vis[0]) - 15]);

	conf.layout.adjust_cluster_size(cluster_size_params);

	var diagonal = conf.layout.diagonal();
	var transform = conf.layout.transform_node;

	svg = tree_div
	    .append("svg")
	    .attr("width", conf.layout.width())
//	    .attr("height", (n_leaves * label.height()()) + 20)
	    .attr("height", conf.layout.height(cluster_size_params) + 30)
	    .attr("fill", "none");

	vis = svg
	    .append("g")
	    .attr("id", "ePeek_st_" + div_id)
	    .attr("transform",
		  "translate(" +
		  conf.layout.translate_vis()[0] +
		  "," +
		  conf.layout.translate_vis()[1] +
		  ")");

	curr.nodes = cluster.nodes(curr.data);
	conf.layout.scale_branch_lengths(curr);
	curr.links = cluster.links(curr.nodes);

	// LINKS
	var link = vis.selectAll("path.ePeek_tree_link")
	    .data(curr.links, function(d){return d.target._id});
	link
	    	.enter()
		.append("path")
	    	.attr("class", "ePeek_tree_link")
	    	.attr("id", function(d) {
	    	    return "ePeek_tree_link_" + div_id + "_" + d.target._id;
	    	})
	    	.attr("fill", "none")
	    	.style("stroke", conf.link_color)
		.attr("d", diagonal);	    

	// NODES
	var node = vis.selectAll("g.ePeek_tree_node")
	    .data(curr.nodes, function(d) {return d._id});

	var new_node = node
	    .enter().append("g")
	    .attr("class", function(n) {
		if (n.children) {
		    if (n.depth == 0) {
			return "root ePeek_tree_node"
		    } else {
			return "inner ePeek_tree_node"
		    }
		} else {
		    return "leaf ePeek_tree_node"
		}
	    })
	    .attr("id", function(d) {
		return "ePeek_tree_node_" + div_id + "_" + d._id
	    })
	    .attr("transform", transform);

	// new_node.on("click", tree.node_info_callback);

	new_node
	    .append('circle')
	    .attr("r", conf.node_circle_size)
	    .attr('fill', conf.node_color)
	    .attr('stroke', '#369')
	    .attr('stroke-width', '2px');

	new_node.on("click", conf.node_info);
	new_node.on("dblclick", conf.node_dbl_info);

	new_node
	    .each(conf.label);

	// Node labels only on leaves
	// But only if skip_labels is false
// 	if (!skip_labels) {
// 	    // LABELS
// 	    new_node
// 		.append("text")
// 		.attr("class", "ePeek_tree_label")
// 		.style("fill", function(d) {return d.children === undefined ? fgColor : bgColor})
// 	    // .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
// 	    // .attr("transform", function(d) {return "translate(10 5)" + layout === "vertical" ? "" : ("rotate(" + (d.x < 180 ? 0 : 180) + ")")})
// 		.attr("transform", function(d) { return "translate(10 5)" })
// 		.text(function(d) {var label = d.name.replace(/_/g, ' ');
// 				   var species_name = d.name.charAt(0).toLowerCase() + d.name.slice(1);
// 				   label = label + ((sp_counts[species_name] !== undefined)  ?
// 						    " [" + (sp_counts[species_name].length) + "]" :
// 						    "");
// 				   return label;})
	    
// 	}

	// Update plots an updated tree
	api.method ('update', function() {
	    var cluster = conf.layout.cluster;
	    var diagonal = conf.layout.diagonal();
	    var transform = conf.layout.transform_node;

	    // var max_leaf_label_length = function (tree) {
	    // 	var max = 0;
	    // 	var leaves = tree.get_all_leaves();
	    // 	for (var i=0; i<leaves.length; i++) {
	    // 	    var label_width = conf.label.width()(leaves[i].data());
	    // 	    if (label_width > max) {
	    // 		max = label_width;
	    // 	    }
	    // 	}
	    // 	return max;
	    // };


	    var max_label_length = max_leaf_label_length(curr.tree);
	    conf.layout.max_leaf_label_width(max_label_length);

	    // Cluster size is the result of...
	    // total width of the vis - transform for the tree - max_leaf_label_width - horizontal transform of the label
	// TODO: Substitute 15 by the transform of the nodes (probably by selecting one node assuming all the nodes have the same transform
	    var n_leaves = curr.tree.get_all_leaves().length;
	    var cluster_size_params = {
		n_leaves : n_leaves,
		label_height : d3.functor(conf.label.height())(),
		label_padding : 15
	    };
	    conf.layout.adjust_cluster_size(cluster_size_params);
// 	    cluster.size([n_leaves * conf.label.height()(),
// 			  (layout.width() - layout.max_leaf_label_width() - layout.translate_vis[0]) - 15]);

	    svg
		.transition()
		.duration(conf.duration)
		.ease(ease)
		.attr("height", conf.layout.height(cluster_size_params) + 30); // height is in the layout
//		.attr("height", (n_leaves * label.height()()) + 20);

	    vis
		.transition()
		.duration(conf.duration)
		.attr("transform",
		      "translate(" +
		      conf.layout.translate_vis()[0] +
		      "," +
		      conf.layout.translate_vis()[1] +
		      ")");
	    
	    // Set up the current tree
	    // var nodes = curr.tree.cluster(cluster).nodes();
	    // var links = cluster.links(nodes);
	    // curr.nodes = curr.tree.cluster(cluster).nodes();
	    curr.nodes = cluster.nodes(curr.data);
	    conf.layout.scale_branch_lengths(curr);
	    // scale_branch_lengths();
	    // phylo(curr.nodes[0], 0);
	    curr.links = cluster.links(curr.nodes);

            // NODES
	    var node = vis.selectAll("g.ePeek_tree_node")
		.data(curr.nodes, function(d) {return d._id});

	    // LINKS
	    var link = vis.selectAll("path.ePeek_tree_link")
		.data(curr.links, function(d){return d.target._id});
	    
	    var exit_link = link
		.exit()
		.remove();
	    

	    // New links are inserted in the prev positions
	    link
		.enter()
		.append("path")
		.attr("class", "ePeek_tree_link")
		.attr("id", function (d) {
		    return "ePeek_tree_link_" + div_id + "_" + d.target._id;
		})
		.attr("fill", "none")
		.attr("stroke", conf.link_color)
		.attr("d", diagonal);

	    // Move the links to their final position, but keeping the integrity of the tree
// 	    link
// 	    	.filter(select_links_to_be_pushed)
// 	    	.each(function(d) {pull_parent.call(this, d, 0)});

	    link
	    //  TODO: Here we will be moving links that have been already moved in the previous filter
	    //  if transitions are slow, this is a good place to optimize
	    	.transition()
		.ease(ease)
	    	.duration(conf.duration)
//	    	.delay((max_depth_exit_node + entering_links) * conf.duration) // TODO: I changed this (from 1). Not sure it is correct
//		.delay(get_new_link_delay)
	    	.attr("d", diagonal);


	    // New nodes are created without radius
	    // The radius is created after the links
	    var new_node = node
		.enter()
		.append("g")
		.attr("class", function(n) {
		    if (n.children) {
			if (n.depth == 0) {
			    return "root ePeek_tree_node"
			} else {
			    return "inner ePeek_tree_node"
			}
		    } else {
			return "leaf ePeek_tree_node"
		    }
		})
		.attr("id", function (d) {
		    return "ePeek_tree_node_" + div_id + "_" + d._id;
		})
		.attr("transform", transform);
   
	    new_node
		.append('circle')
		.attr("r", 1e-6)
		.attr('stroke', '#369')
		.attr('stroke-width', '2px')
		.transition()
		.duration(conf.duration)
		.attr("r", conf.node_circle_size);

	    new_node.on("click", conf.node_info);
	    new_node.on("dblclick", conf.node_dbl_info);

	    node.each(conf.label.remove);
	    node.each(conf.label);

	    // node color is a dynamic property
	    node.select("circle").attr('fill', conf.node_color);
	    
	    // Node labels only on leaves
	    // But only if skip_labels is false
// 	    if (!skip_labels) {
// 		new_node
// 		    .append("text")
// 		    .attr("class", "ePeek_tree_label")
// 		    .style("fill", function(d) {return d.children === undefined ? fgColor : bgColor})
// 		// .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
// 		// .attr("transform", function(d) {return "translate(10 5)" + layout === "vertical" ? "" : ("rotate(" + (d.x < 180 ? 0 : 180) + ")")})
// 		    .attr("transform", function(d) { return "translate(10 5)" })
// 		    .text("")
// 		    .transition()
// 		    .duration(conf.duration)
// //		    .delay((max_depth_exit_node + entering_links + 1) * conf.duration)
// 		    .text(function(d) {var label = d.name.replace(/_/g, ' ');
// 				       var species_name = d.name.charAt(0).toLowerCase() + d.name.slice(1);
// 				       label = label + ((sp_counts[species_name] !== undefined)  ?
// 							" [" + (sp_counts[species_name].length) + "]" :
// 							"");
// 				       return label;})
// 	    }

	    node
		.transition()
		.ease(ease)
		.duration(conf.duration)
		.attr("transform", transform);

	    // Exiting nodes are just removed
	    node
		.exit()
		.remove();
	});
    };

    // API
    var api = epeek.utils.api (tree)
	.getset (conf)

    // TODO: Rewrite data using getset / finalizers & transforms
    api.method ('data', function (d) {
	if (!arguments.length) {
	    return base.data;
	}

	// The original data is stored as the base and curr data
	base.data = d;
	curr.data = d;

	// Set up a new tree based on the data
	var newtree = epeek.tree.tree(base.data);

	// The nodes are marked because we want to be able to join data after selecting a subtree
	// var i = epeek.misc.iteratorInt();
	// newtree.apply(function(d) {d.property('__epeek_id__', i())});
	// newtree.apply(function(d) {d.property('__inSubTree__', {prev : true, curr : true})});

	tree.tree(newtree);
	return tree;
    });

    // TODO: Rewrite tree using getset / finalizers & transforms
    api.method ('tree', function (t) {
    	if (!arguments.length) {
    	    return base.tree;
    	}

	// The original tree is stored as the base, prev and curr tree
    	base.tree = t;
	curr.tree = base.tree;
//	prev.tree = base.tree;
    	return tree;
    });

    api.method ('subtree', function (curr_nodes) {
	// var curr_nodes = [];
	// var orig_tree = tree.tree();
	// var orig_data = tree.data();
	// for (var i=0; i<node_names.length; i++) {
	//     var node = orig_tree.find_node_by_name(node_names[i]);
	//     curr_nodes.push(orig_tree.find_node_by_name(node_names[i]));
	// }
	var subtree = base.tree.subtree(curr_nodes);
	curr.data = subtree.data();
	curr.tree = subtree;

	return tree;
    });

    api.method ('toggle_node', function (node_data) {
	tree.tree().toggle_node(node_data);
	return tree;
    });

    api.method ('focus_node', function (node_data) {
	// find 
	var found_node = tree.tree().find_node_by_field(node_data._id, '_id');
	tree.subtree(found_node.get_all_leaves());

	return tree;
    });

//     tree.subtree = function (node_names) {
// 	// We have to first clean the previous subtree (if any)
// 	// This means un-marking the nodes in the subtree:
// 	base.tree.apply(function(d){
// 	    d.property('__inSubTree__').prev = d.property('__inSubTree__').curr
// 	})
// 	base.tree.apply(function(d){
// 	    d.property('__inSubTree__').curr = false
// 	});

// 	var orig_tree = tree.tree();
// 	var orig_data = tree.data();

// 	//  We set up the prev data and tree
// // 	var prev_data = copy_node(curr.data);
// // 	for (var i=0; i<curr.data.children.length; i++) {
// // 	    copy_data (curr.data.children[i], prev_data, function(d) {return true});
// // 	}
// // 	prev.data = prev_data;
// // 	prev.tree = epeek.tree(prev.data);

// 	//  We set up the curr data and tree
// 	var curr_nodes = [];
// 	for (var i=0; i<node_names.length; i++) {
// 	    curr_nodes.push(orig_tree.find_node_by_name(orig_data,node_names[i]));
// 	}

// 	for (var i=0; i<curr_nodes.length; i++) {
// 	    orig_tree.upstream(curr_nodes[i], function(d) {
// 		d.property('__inSubTree__').curr = true
// 	    });
// 	}
	
// 	var curr_data = copy_node(orig_data);
// 	for (var i=0; i<orig_data.children.length; i++) {
//             copy_data (orig_data.children[i], curr_data, function(d) {
// 		return ((d.__inSubTree__.curr) && (!is_singleton(d)));
// 	    });
// 	}

// 	curr.data = curr_data;
// 	curr.tree = epeek.tree.tree(curr.data);

// 	return tree;
//     };


    // TODO: copy_data is not a good name for this
//     var copy_data = function (orig_data, sub_data, condition) {
// 	if (orig_data === undefined) {
// 	    return;
// 	}

// 	if (condition(orig_data)) {
// 	    var copy = copy_node(orig_data);

// 	    if (sub_data.children === undefined) {
// 		sub_data.children = [];
// 	    }
// 	    sub_data.children.push(copy);
// 	    if (orig_data.children === undefined) {
// 		return;
// 	    }
// 	    for (var i = 0; i < orig_data.children.length; i++) {
// 		copy_data (orig_data.children[i], copy, condition);
// 	    }
// 	} else {
// 	    if (orig_data.children === undefined) {
// 		return;
// 	    }
// 	    for (var i = 0; i < orig_data.children.length; i++) {
// 		copy_data(orig_data.children[i], sub_data, condition);
// 	    }
// 	}
//     };

//     var is_singleton = function (node) {
// 	var n_children = 0;
// 	if (node.children === undefined) {
// 	    return false;
// 	}

// 	for (var i = 0; i < node.children.length; i++) {
// 	    if (node.children[i].property('__inSubTree__').curr) {
// 		n_children++;
// 	    }
// 	}

// 	if (n_children === 1) {
// 	    node.property('__inSubTree__').curr = false;
// 	}

// 	return n_children === 1;
//     };

//     var copy_node = function (node) {
// 	var copy = {};
// 	for (var param in node) {
// 	    if ((param === "children") || (param === "children") || (param === "parent")) {
// 		continue;
// 	    }
// 	    if (node.hasOwnProperty(param)) {
// 		copy[param] = node[param];
// 	    }
// 	}
// 	return copy;
//     };

    var swap_nodes = function (src, dst) {
	var copy = copy_node (dst);
	dst = src;
	src = copy;
	return;
    };

    api.method ('tooltip', function () {
	// var tooltip = epeek.tooltip().type("table");
	var tooltip = epeek.tooltip.table();
	var tree_tooltip = function (node) {
	    var obj = {};
	    obj.header = {
		label : "Name",
		value : node.name
	    };
	    obj.rows = [];
	    obj.rows.push({
		label : "_id",
		value : node._id
	    });
	    obj.rows.push({
		label : "Depth",
		value : node.depth
	    });
	    obj.rows.push({
		label : "Length",
		value : node.length
	    });
	    obj.rows.push({
		label : "N.Children",
		value : node.children ? node.children.length : 0
	    });

	tooltip.call(this, obj);
	};

	return tree_tooltip;
    });

    // tree.update = function() {

    // 	var t = function(sp_counts) {
    // 	    reset_tree(species_tree);
    // 	    var sp_names = get_names_of_present_species(sp_counts);
    // 	    var present_nodes  = get_tree_nodes_by_names(species_tree, sp_names);
    // 	    var lca_node = epeek_tree.lca(present_nodes)

    // 	    decorate_tree(lca_node);
    // 	    nodes_present(species_tree, present_nodes);

    // 	    vis.selectAll("path.link")
    // 		.data(cluster.links(epeek_tree))
    // 		.transition()
    // 		.style("stroke", function(d){
    // 	    	    if (d.source.real_present === 1) {
    // 	    		return fgColor;
    // 	    	    }
    // 	    	    if (d.source.present_node === 1) {
    // 	    		return bgColor;
    // 	    	    }
    // 	    	    return "fff";
    // 		});

    // 	    vis.selectAll("circle")
    // 		.data(epeek_tree.filter(function(n) { return n.x !== undefined; }))
    // 		.attr("class", function(d) {
    // 		    if (d.real_present) {
    // 			return "present";
    // 		    }
    // 		    if (d.present_node) {
    // 			return "dubious";
    // 		    }
    // 		    return "absent";
    // 		})

    // 	    var labels = vis.selectAll("text")
    // 		.data(epeek_tree.filter(function(d) { return d.x !== undefined && !d.children; }))
    // 		.transition()
    // 		.style("fill", function (d) {
    // 		    if (d.name === tree.species()) {
    // 			return "red";
    // 		    }
    // 		    if (d.real_present === 1) {
    // 			return fgColor;
    // 		    }
    // 		    return bgColor;
    // 		    // return d.name === tree.species() ? "red" : "black"
    // 		})
    // 		.text(function(d) { var label = d.name.replace(/_/g, ' ');
    // 				    var species_name = d.name.charAt(0).toLowerCase() + d.name.slice(1);
    // 				    label = label + " [" + (sp_counts[species_name] === undefined ? 0 : sp_counts[species_name].length) + "]";
    // 				    return label;
    // 				  });
    // 	    };

    // 	return t;
    // };


    // var decorate_tree = function (node) {
    // 	if (node !== undefined) {
    // 	    epeek_tree.apply(node, function(n) {n.present_node = 1});
    // 	}
    // };

    // var reset_tree = function (node) {
    // 	if (node !== undefined) {
    // 	    epeek_tree.apply(node, function(n) {n.present_node = 0; n.real_present = 0;});
    // 	}
    // }


    var nodes_present = function (tree, nodes) {
	for (var i = 0; i < nodes.length; i++) {
	    var tree_node = epeek_tree.find_node_by_name(tree, nodes[i].name);
	    if (tree_node === undefined) {
		console.log("NO NODE FOUND WITH NAME " + nodes[i]);
	    } else {
		tree_node.real_present = 1;
	    }
	}

	// TODO: Highly inefficient algorithm ahead
	var max_depth = max_tree_depth(tree);
	for (var i = 0; i < max_depth; i++) {
	    var children_present = function(node) {
		if (node.children !== undefined) {
		    if (check_children_present(node)) {
			node.real_present = 1;
		    }
		    for (var i = 0; i < node.children.length; i++) {
			children_present(node.children[i]);
		    }
		}
	    };
	    children_present(tree);
	}
    };

    var check_children_present = function(node) {
	var n_present = 0;
	for (var i = 0; i < node.children.length; i++) {
	    if (node.children[i].real_present === 1) {
		n_present++;
	    }
	}
	if (node.children.length === n_present) {
	    return true;
	}
	return false;
    }

    var max_tree_depth = function (tree, max) {
	if (max === undefined) {
	    max = 0
	}
	var this_depth = tree.depth;
	if (tree.children !== undefined) {
	    for (var i = 0; i < tree.children.length; i++) {
		return max_tree_depth(tree.children[i], this_depth > max ? this_depth : max)
	    }
	}
	return max;
    };

    var get_names_of_present_species = function (sp_nodes) {
	var names = [];
	for (var i in sp_nodes) {
	    if (sp_nodes.hasOwnProperty(i)) {
		names.push(i.charAt(0).toUpperCase() + i.slice(1));
	    }
	}
	return names;
    };

    api.method ('get_tree_nodes_by_names', function (names) {
	var nodes = [];
	for (var i = 0; i < names.length; i++) {
	    var node = tree.tree().find_node_by_name(names[i]);
	    if (node !== undefined) {
		nodes.push(node);
	    }
	}
	return nodes;
    });

    return tree;
};

//var newick_species_tree_big = "(((((((((((((((((((Escherichia_coli_EDL933:0.00000,Escherichia_coli_O157_H7:0.00000)96:0.00044,((Escherichia_coli_O6:0.00000,Escherichia_coli_K12:0.00022)76:0.00022,(Shigella_flexneri_2a_2457T:0.00000,Shigella_flexneri_2a_301:0.00000)100:0.00266)75:0.00000)100:0.00813,((Salmonella_enterica:0.00000,Salmonella_typhi:0.00000)100:0.00146,Salmonella_typhimurium:0.00075)100:0.00702)100:0.03131,((Yersinia_pestis_Medievalis:0.00000,(Yersinia_pestis_KIM:0.00000,Yersinia_pestis_CO92:0.00000)31:0.00000)100:0.03398,Photorhabdus_luminescens:0.05076)61:0.01182)98:0.02183,((Blochmannia_floridanus:0.32481,Wigglesworthia_brevipalpis:0.35452)100:0.08332,(Buchnera_aphidicola_Bp:0.27492,(Buchnera_aphidicola_APS:0.09535,Buchnera_aphidicola_Sg:0.10235)100:0.10140)100:0.06497)100:0.15030)100:0.02808,((Pasteurella_multocida:0.03441,Haemophilus_influenzae:0.03754)94:0.01571,Haemophilus_ducreyi:0.05333)100:0.07365)100:0.03759,((((Vibrio_vulnificus_YJ016:0.00021,Vibrio_vulnificus_CMCP6:0.00291)100:0.01212,Vibrio_parahaemolyticus:0.01985)100:0.01536,Vibrio_cholerae:0.02995)100:0.02661,Photobacterium_profundum:0.06131)100:0.05597)81:0.03492,Shewanella_oneidensis:0.10577)100:0.12234,((Pseudomonas_putida:0.02741,Pseudomonas_syringae:0.03162)100:0.02904,Pseudomonas_aeruginosa:0.03202)100:0.14456)98:0.04492,((Xylella_fastidiosa_700964:0.01324,Xylella_fastidiosa_9a5c:0.00802)100:0.10192,(Xanthomonas_axonopodis:0.01069,Xanthomonas_campestris:0.00934)100:0.05037)100:0.24151)49:0.02475,Coxiella_burnetii:0.33185)54:0.03328,((((Neisseria_meningitidis_A:0.00400,Neisseria_meningitidis_B:0.00134)100:0.12615,Chromobacterium_violaceum:0.09623)100:0.07131,((Bordetella_pertussis:0.00127,(Bordetella_parapertussis:0.00199,Bordetella_bronchiseptica:0.00022)67:0.00006)100:0.14218,Ralstonia_solanacearum:0.11464)100:0.08478)75:0.03840,Nitrosomonas_europaea:0.22059)100:0.08761)100:0.16913,((((((Agrobacterium_tumefaciens_Cereon:0.00000,Agrobacterium_tumefaciens_WashU:0.00000)100:0.05735,Rhizobium_meliloti:0.05114)100:0.05575,((Brucella_suis:0.00102,Brucella_melitensis:0.00184)100:0.08660,Rhizobium_loti:0.09308)51:0.02384)100:0.08637,(Rhodopseudomonas_palustris:0.04182,Bradyrhizobium_japonicum:0.06346)100:0.14122)100:0.05767,Caulobacter_crescentus:0.23943)100:0.11257,(Wolbachia_sp._wMel:0.51596,(Rickettsia_prowazekii:0.04245,Rickettsia_conorii:0.02487)100:0.38019)100:0.12058)100:0.12365)100:0.06301,((((Helicobacter_pylori_J99:0.00897,Helicobacter_pylori_26695:0.00637)100:0.19055,Helicobacter_hepaticus:0.12643)100:0.05330,Wolinella_succinogenes:0.11644)100:0.09105,Campylobacter_jejuni:0.20399)100:0.41390)82:0.04428,((Desulfovibrio_vulgaris:0.38320,(Geobacter_sulfurreducens:0.22491,Bdellovibrio_bacteriovorus:0.45934)43:0.04870)69:0.04100,(Acidobacterium_capsulatum:0.24572,Solibacter_usitatus:0.29086)100:0.20514)64:0.04214)98:0.05551,((Fusobacterium_nucleatum:0.45615,(Aquifex_aeolicus:0.40986,Thermotoga_maritima:0.34182)100:0.07696)35:0.03606,(((Thermus_thermophilus:0.26583,Deinococcus_radiodurans:0.29763)100:0.24776,Dehalococcoides_ethenogenes:0.53988)35:0.04370,((((Nostoc_sp._PCC_7120:0.12014,Synechocystis_sp._PCC6803:0.15652)98:0.04331,Synechococcus_elongatus:0.13147)100:0.05040,(((Synechococcus_sp._WH8102:0.06780,Prochlorococcus_marinus_MIT9313:0.05434)100:0.04879,Prochlorococcus_marinus_SS120:0.10211)74:0.04238,Prochlorococcus_marinus_CCMP1378:0.16170)100:0.20442)100:0.07646,Gloeobacter_violaceus:0.23764)100:0.24501)39:0.04332)51:0.02720)74:0.03471,((((Gemmata_obscuriglobus:0.36751,Rhodopirellula_baltica:0.38017)100:0.24062,((Leptospira_interrogans_L1-130:0.00000,Leptospira_interrogans_56601:0.00027)100:0.47573,((Treponema_pallidum:0.25544,Treponema_denticola:0.16072)100:0.19057,Borrelia_burgdorferi:0.42323)100:0.20278)95:0.07248)42:0.04615,(((Tropheryma_whipplei_TW08/27:0.00009,Tropheryma_whipplei_Twist:0.00081)100:0.44723,Bifidobacterium_longum:0.29283)100:0.14429,(((((Corynebacterium_glutamicum_13032:0.00022,Corynebacterium_glutamicum:0.00000)100:0.03415,Corynebacterium_efficiens:0.02559)100:0.03682,Corynebacterium_diphtheriae:0.06479)100:0.13907,(((Mycobacterium_bovis:0.00067,(Mycobacterium_tuberculosis_CDC1551:0.00000,Mycobacterium_tuberculosis_H37Rv:0.00000)98:0.00022)100:0.03027,Mycobacterium_leprae:0.05135)97:0.01514,Mycobacterium_paratuberculosis:0.02091)100:0.11523)100:0.09883,(Streptomyces_avermitilis:0.02680,Streptomyces_coelicolor:0.02678)100:0.16707)91:0.06110)100:0.26800)23:0.03480,((Fibrobacter_succinogenes:0.51984,(Chlorobium_tepidum:0.37204,(Porphyromonas_gingivalis:0.11304,Bacteroides_thetaiotaomicron:0.13145)100:0.34694)100:0.09237)62:0.04841,(((Chlamydophila_pneumoniae_TW183:0.00000,(Chlamydia_pneumoniae_J138:0.00000,(Chlamydia_pneumoniae_CWL029:0.00000,Chlamydia_pneumoniae_AR39:0.00000)37:0.00000)44:0.00000)100:0.10482,Chlamydophila_caviae:0.05903)98:0.04170,(Chlamydia_muridarum:0.01938,Chlamydia_trachomatis:0.02643)100:0.06809)100:0.60169)32:0.04443)67:0.04284)66:0.02646,((Thermoanaerobacter_tengcongensis:0.17512,((Clostridium_tetani:0.10918,Clostridium_perfringens:0.11535)78:0.03238,Clostridium_acetobutylicum:0.11396)100:0.15056)100:0.11788,(((((Mycoplasma_mobile:0.27702,Mycoplasma_pulmonis:0.28761)100:0.28466,((((Mycoplasma_pneumoniae:0.10966,Mycoplasma_genitalium:0.11268)100:0.31768,Mycoplasma_gallisepticum:0.24373)100:0.14180,Mycoplasma_penetrans:0.34890)94:0.06674,Ureaplasma_parvum:0.33874)100:0.19177)100:0.07341,Mycoplasma_mycoides:0.37680)100:0.12541,Phytoplasma_Onion_yellows:0.47843)100:0.09099,(((((Listeria_monocytogenes_F2365:0.00063,Listeria_monocytogenes_EGD:0.00144)90:0.00235,Listeria_innocua:0.00248)100:0.13517,((Oceanobacillus_iheyensis:0.13838,Bacillus_halodurans:0.09280)91:0.02676,(((Bacillus_cereus_ATCC_14579:0.00342,Bacillus_cereus_ATCC_10987:0.00123)100:0.00573,Bacillus_anthracis:0.00331)100:0.08924,Bacillus_subtilis:0.07876)96:0.01984)100:0.03907)69:0.02816,((Staphylococcus_aureus_MW2:0.00000,(Staphylococcus_aureus_N315:0.00022,Staphylococcus_aureus_Mu50:0.00022)61:0.00022)100:0.02479,Staphylococcus_epidermidis:0.03246)100:0.17366)64:0.02828,(((((((Streptococcus_agalactiae_III:0.00110,Streptococcus_agalactiae_V:0.00155)100:0.01637,(Streptococcus_pyogenes_M1:0.00134,(Streptococcus_pyogenes_MGAS8232:0.00045,(Streptococcus_pyogenes_MGAS315:0.00000,Streptococcus_pyogenes_SSI-1:0.00022)100:0.00110)87:0.00066)100:0.02250)100:0.01360,Streptococcus_mutans:0.04319)99:0.01920,(Streptococcus_pneumoniae_R6:0.00119,Streptococcus_pneumoniae_TIGR4:0.00124)100:0.03607)100:0.04983,Lactococcus_lactis:0.11214)100:0.08901,Enterococcus_faecalis:0.07946)100:0.03958,(Lactobacillus_johnsonii:0.20999,Lactobacillus_plantarum:0.14371)100:0.06763)100:0.08989)100:0.08905)92:0.09540)54:0.04315)Bacteria:1.34959,(((((Thalassiosira_pseudonana:0.33483,(Cryptosporidium_hominis:0.25048,Plasmodium_falciparum:0.28267)100:0.14359)42:0.03495,(((Oryza_sativa:0.07623,Arabidopsis_thaliana:0.09366)100:0.15770,Cyanidioschyzon_merolae:0.38319)96:0.08133,(Dictyostelium_discoideum:0.34685,(((Eremothecium_gossypii:0.07298,Saccharomyces_cerevisiae:0.07619)100:0.21170,Schizosaccharomyces_pombe:0.24665)100:0.15370,(((Anopheles_gambiae:0.10724,Drosophila_melanogaster:0.10233)100:0.09870,((Takifugu_rubripes:0.03142,Danio_rerio:0.05230)100:0.04335,(((Rattus_norvegicus:0.03107,Mus_musculus:0.01651)91:0.00398,(Homo_sapiens:0.00957,Pan_troglodytes:0.03864)100:0.01549)99:0.01629,Gallus_gallus:0.04596)100:0.01859)100:0.09688)95:0.03693,(Caenorhabditis_elegans:0.01843,Caenorhabditis_briggsae:0.01896)100:0.24324)100:0.09911)85:0.04004)41:0.02708)44:0.02636)87:0.06455,Leishmania_major:0.45664)100:0.10129,Giardia_lamblia:0.55482)100:0.57543,((Nanoarchaeum_equitans:0.81078,(((Sulfolobus_tokodaii:0.17389,Sulfolobus_solfataricus:0.18962)100:0.33720,Aeropyrum_pernix:0.43380)94:0.09462,Pyrobaculum_aerophilum:0.55514)100:0.12018)100:0.15444,((Thermoplasma_volcanium:0.10412,Thermoplasma_acidophilum:0.09785)100:0.66151,((((Methanobacterium_thermautotrophicum:0.36583,Methanopyrus_kandleri:0.35331)99:0.07446,(Methanococcus_maripaludis:0.28592,Methanococcus_jannaschii:0.13226)100:0.23828)100:0.06284,((Pyrococcus_horikoshii:0.02786,Pyrococcus_abyssi:0.02179)100:0.02239,Pyrococcus_furiosus:0.02366)100:0.36220)51:0.04469,(Archaeoglobus_fulgidus:0.34660,(Halobacterium_sp._NRC-1:0.61597,(Methanosarcina_acetivorans:0.02602,Methanosarcina_mazei:0.03087)100:0.30588)100:0.12801)100:0.10395)62:0.06815)99:0.11833)100:0.43325):0.88776);";
