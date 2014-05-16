var epeek_theme_track_swap_tracks = function() {

    var theme = function(gB, div) {

	// Block Track1
	var block_track1 = epeek.track.track()
	    .height(30)
	    .background_color("white")
	    .data(epeek.track.data()
		  .update(
		      epeek.track.retriever.sync()
			  .retriever (function () {
			      return [
				  {
				      start : 20,
				      end   : 100
				  }
			      ]
			  })
		  )
		 )
	    .display(epeek.track.feature.block()
		     .foreground_color("blue")
		     .index(function (d) {
			 return d.start;
		     }));

	// Block Track1
	var block_track2 = epeek.track.track()
	    .height(30)
	    .background_color("white")
	    .data(epeek.track.data()
		  .update(
		      epeek.track.retriever.sync()
			  .retriever (function () {
			      return [
				  {
				      start : 200,
				      end   : 400
				  }
			      ]
			  })
		  )
		 )
	    .display(epeek.track.feature.block()
		     .foreground_color("red")
		     .index(function (d) {
			 return d.start;
		     }));

	// Axis Track1
	var axis_track = epeek.track.track()
	    .height(30)
	    .background_color("white")
	    .display(epeek.track.feature.axis()
		     .orientation("top")
		    );

	// Location Track1
	var loc_track = epeek.track.track()
	    .height(30)
	    .background_color("white")
	    .display(epeek.track.feature.location());

	gB
	    .right(1000)
	    .add_track(loc_track)
	    .add_track(axis_track)
	    .add_track(block_track1)
	    .add_track(block_track2);

	var block_ids = [];
	block_ids.push(block_track1.id());
	block_ids.push(block_track2.id());

	var order = [[loc_track, axis_track, block_track2, block_track1],
		     [loc_track, axis_track, block_track1, block_track2]
		    ];

	// var order = [[4,3,2,1],[4,3,1,2]];
	var i = 2;
	var swap_tracks = function () {
	    gB.reorder(order[i++%2]);
	};

	d3.select(div).append("button")
	    .on("click", swap_tracks)
	    .text("Swap tracks");


	gB(div);
	gB.start();
    };

    return theme;
};
