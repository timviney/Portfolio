import React from 'react';
import { pubPointGallery } from "../../assets/index";

//TODO -- Add links to relevant papers and resources and more commentary

const PubPointBlog = () => {
  return (
    <section className="w-full min-h-screen bg-bodyColor">
      {/* Hero Section */}
      <div className="w-full bg-black bg-opacity-25 border-b border-designColor border-opacity-30">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h1 className="text-5xl md:text-6xl font-titleFont font-bold text-lightText mb-4 tracking-tight">
            Building PubPoint
          </h1>
          <p className="text-xl text-designColor font-bodyFont font-light">
            How we're using Bayesian Emulation to solve the pub meetup problem
          </p>
        </div>
      </div>

      {/* Main Content */}
      <article className="max-w-4xl mx-auto px-6 py-12 font-bodyFont">
        {/* Introduction */}
        <div className="mb-16">
          <div className="bg-black bg-opacity-25 border border-gray-600 rounded-lg p-8 mb-8 shadow-shadowOne hover:bg-opacity-40 transition-all duration-300">
            <h2 className="text-2xl font-titleFont font-bold text-designColor mb-4">The Problem</h2>
            <p className="text-lg text-lightText leading-relaxed">
              The idea behind PubPoint is simple – I'm meeting with friends based all over London, why isn't there an app
              that finds the best pub to meet in? The answer to that question, as we have found out on this project, is
              because doing so is actually quite hard.
            </p>
          </div>

          <div className="prose prose-invert prose-lg max-w-none">
            <p className="text-lightText leading-relaxed mb-6">
              At first, the answer seemed quite simple. We create a simple app that hooks up to the Google Maps API, take
              each person in the group's location, and call the API repeatedly to work out which pub gives the overall
              minimum travel time. You can then easily add filters around requirements for pubs (min ratings, dog friendly,
              etc.) and let users find their personal best pub. Coding this up would be a breeze, but we hit a blocker very
              quickly.
            </p>

            <div className="bg-black bg-opacity-25 border-l-4 border-red-500 p-6 rounded-r-lg mb-6 shadow-shadowOne">
              <p className="text-lightText font-semibold mb-2">💰 The Cost Problem</p>
              <p className="text-lightText">
                At time of writing, once you have used up the monthly free requests, using the Google Routes API to find the
                travel time from one user to all 3500 pubs in London would cost <span className="text-red-400 font-bold">$18</span>. Even narrowing this down to say 1000 pubs
                would still cost <span className="text-red-400 font-bold">$5 per person per request</span>, a fee neither us nor our users would be willing to pay.
              </p>
            </div>

            <p className="text-lightText leading-relaxed mb-6">
              Even looking into other mapping services that we could use instead of the mainstream Google; it is very unlikely that this brute force approach to calculating travel
              times would ever be sustainable.
            </p>

          </div>
        </div>

        {/* The Solution */}
        <div className="mb-16">
          <div className="bg-black bg-opacity-25 border border-designColor border-opacity-50 rounded-lg p-8 mb-8 shadow-shadowOne hover:bg-opacity-40 transition-all duration-300">
            <h2 className="text-2xl font-titleFont font-bold text-designColor mb-4">The Solution: Emulation</h2>
            <p className="text-lightText leading-relaxed">
              What we need here is something to use in place of an external API that will give good enough results but at a
              fraction of the cost. Treating the Google API as a simulator of the real-life travel times, we need something
              to simulate that simulator – known in mathematics as <span className="text-designColor font-semibold">emulation</span>. Fortunately for us, this is exactly what I
              wrote my dissertation on back at Durham University.
            </p>
          </div>

          <p className="text-lightText leading-relaxed mb-6">
            If we run enough samples of the original API, we can train a new model to act as our emulator, which will allow us to estimate the travel times with a fast local
            calculation rather than an expensive API call. If this emulator is good enough, then we can easily calculate
            the travel times from each user to every pub and pick the best from there.
          </p>

          <p className="text-lightText leading-relaxed mb-6">
            The exact approach we have gone for with this emulator is to follow the work of{" "}
            <a
              href="https://bmcsystbiol.biomedcentral.com/articles/10.1186/s12918-017-0484-3"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-designColor transition-colors"
            >
              Vernon et al.
            </a>{" "}
            – use Bayesian Emulation with a Gaussian Process (GP) model to emulate the
            results around an initial set of training data. The maths behind this can
            get a little detailed, but the principal is relatively simple. We know
            exactly what the values are for our emulator at each point of our training
            data, and we estimate the values in between. These estimates are weighted by
            the values of the training data around them, with the results being normally
            distributed thanks to the GP.
          </p>
        </div>

        {/* Technical Details */}
        <div className="mb-16">
          <h2 className="text-3xl font-titleFont font-bold text-lightText mb-8">Building the Emulator</h2>

          <div className="grid gap-4 mb-8">
            <div className="bg-black bg-opacity-25 border border-gray-600 rounded-lg p-6 shadow-shadowOne hover:bg-opacity-40 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <h3 className="text-lg font-titleFont font-semibold text-designColor mb-2">True Function</h3>
              <p className="text-lightText">This is what we are actually modelling / replicating from the API (our simulator).
                Our true function here is the travel time from the Google API from any start point to any endpoint.</p>
            </div>

            <div className="bg-black bg-opacity-25 border border-gray-600 rounded-lg p-6 shadow-shadowOne hover:bg-opacity-40 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <h3 className="text-lg font-titleFont font-semibold text-designColor mb-2">Solution Space</h3>
              <p className="text-lightText">These are the inputs into the simulator/emulator that we are using. Any location can be defined
                by its coordinates, a longitude and a latitude. Since we have two locations, an origin and a destination, we end up with
                four inputs: <span className="font-mono text-designColor">origin_lat</span>, <span className="font-mono text-designColor">origin_lng</span>, <span className="font-mono text-designColor">destination_lat</span>, <span className="font-mono text-designColor">destination_lng</span>. This
                means our model has 4 dimensions, and here our solution space is the general area of London, across both the origin and the destination.
              </p>
            </div>

            <div className="bg-black bg-opacity-25 border border-gray-600 rounded-lg p-6 shadow-shadowOne hover:bg-opacity-40 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <h3 className="text-lg font-titleFont font-semibold text-designColor mb-2">Mean (Beta Function)</h3>
              <p className="text-lightText">We need to start with an estimate of the average time to get from one place in London to another.
                Often it seems that no matter the direction, everywhere in London is 45 minutes away. So, we take 45 minutes as our starting mean estimate.
              </p>
            </div>

            <div className="bg-black bg-opacity-25 border border-gray-600 rounded-lg p-6 shadow-shadowOne hover:bg-opacity-40 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <h3 className="text-lg font-titleFont font-semibold text-designColor mb-2">Standard Deviation</h3>
              <p className="text-lightText">This is how much we expect the travel times to vary from the mean. This is less of an easy estimate, so we calculate this based on our training data.</p>
            </div>

            <div className="bg-black bg-opacity-25 border border-gray-600 rounded-lg p-6 shadow-shadowOne hover:bg-opacity-40 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <h3 className="text-lg font-titleFont font-semibold text-designColor mb-2">Correlation Length (Theta)</h3>
              <p className="text-lightText">This is a measure of how far away training data must be to influence the value you are emulating.
                A standard approach is to take a quarter width of your solution space, so a quarter the width of London.
              </p>
            </div>
          </div>
        </div>

        {/* Experiments */}
        <div className="mb-16">
          <h2 className="text-3xl font-titleFont font-bold text-lightText mb-8">Testing & Results</h2>

          <p className="text-lightText leading-relaxed mb-6">
            With all these now decided, we can gather some training data from the API, follow the maths, and create our Bayesian Emulator.
          </p>

          {/* Test 1 */}
          <div className="mb-12">
            <div className="bg-black bg-opacity-25 border border-designColor border-opacity-50 rounded-lg p-6 mb-6 shadow-shadowOne">
              <h3 className="text-xl font-titleFont font-semibold text-designColor mb-3">Test 1: Single Starting Point (70×70 grid)</h3>
              <p className="text-lightText mb-4">
                At first, we can start simple. Instead of trying to create a model that emulates the travel time from any starting point
                to any end point in London, let’s take a single plane of the 4-dimensional space and see if we can model that. In practice,
                this means fixing our starting point (and therefore removing 2 degrees of freedom) and creating a model that emulates the
                travel time from that specific starting point to anywhere in London. Doing this leaves us with a simple 2D map that we can
                then use to display and validate the results.
              </p>
              <p className="text-lightText">
                We take our starting point as Warwick Avenue station in NW London and gather
                our training data as a 70*70 grid across London, giving us 4900 data points. Feeding this data into our emulator and then
                using it to estimate all the values in between, we find ourselves starting with some sensible results:
              </p>
            </div>

            <div className="bg-[#191b1e] rounded-lg p-4 border border-gray-600 mb-4 shadow-shadowOne">
              <img src={pubPointGallery[0]} alt="Model output 1" className="w-full rounded-lg" />
            </div>

            <p className="text-green-400 font-semibold mb-4">✓ Result: Looking good! You can even see obvious patterns based on the areas.</p>
            <p className="text-lightText leading-relaxed mb-6">
              For example, you can see the rough line of the Bakerloo line heading from Wembley to Central, the Elizabeth line running
              from Ealing to East London and the Victoria line into Brixton. It also recognises that Camden takes longer to get to despite
              being quite close, due to the poor connections between it and West London.
            </p>
          </div>

          {/* Test 2 */}
          <div className="mb-12">
            <div className="bg-black bg-opacity-25 border border-designColor border-opacity-50 rounded-lg p-6 mb-6 shadow-shadowOne">
              <h3 className="text-xl font-titleFont font-semibold text-designColor mb-3">Test 2: Empirical Validation (30 locations)</h3>
              <p className="text-lightText">
                Now we want to evaluate it based on an empirical measure. Taking a set of 30 locations (each different transport connections),
                we can perform history-matching. This is where we compare the difference between our emulated model and the real simulation
                (i.e. the results from Google’s API directly). Doing this we get the results:
              </p>
            </div>

            <div className="bg-[#191b1e] rounded-lg p-4 border border-gray-600 mb-4 shadow-shadowOne">
              <img src={pubPointGallery[1]} alt="Model output 2" className="w-full rounded-lg" />
            </div>

            <p className="text-green-400 font-semibold mb-4">✓ Result: All samples within 18 minutes of actual value. Mean error {"<"}5 minutes.</p>
            <p className="text-lightText leading-relaxed mb-6">
              If we had a full model based on this level of accuracy, then we could surely use this to get some sensible pub suggestions!
            </p>
            <p className="text-lightText leading-relaxed mb-6">
              Testing this further, I wanted to see how small we could go with the training data while still getting some sensible results.
              Reducing to a 40*40 grid, giving 1600 training points, so about a third of before, we were able to get some very
              similar results (meaning I have not bothered to display here again). The evaluation results were ever so slightly worse, but
              the mean difference was still within 5 minutes. In theory this means we could scale up to a full model with similar results
              using a 40*40*40*40 grid, which would mean needing 2,560,000 training data points. This would cost around $6000 dollars from
              the Google API, which may not be a huge investment for an average business, but sits a little outside our current budget.
            </p>
          </div>

          {/* Test 3 */}
          <div className="mb-12">
            <div className="bg-black bg-opacity-25 border border-designColor border-opacity-50 rounded-lg p-6 mb-6 shadow-shadowOne">
              <h3 className="text-xl font-titleFont font-semibold text-designColor mb-3">Test 3: Full 4D Model (5000-point Latin Hypercube)</h3>
              <p className="text-lightText">
                Instead, we can try building a full model using much less data and see what happens. Now allowing any origin location as well
                as destination, we have 4 dimensions that we need to play with. Here we use 5000-point{" "}
                <a
                  href="https://en.wikipedia.org/wiki/Latin_hypercube_sampling"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-designColor transition-colors"
                >
                  4D Latin Hypercube Sample
                </a>{", "}
                again following Vernon et al., to build up our training data but with less inherent correlation than a standard grid. Plugging this data in and doing the maths, we can again evaluate the results by looking at the same plane as before, ie, by emulating the travel times from Warwick Avenue and seeing what the results look like. When we do so, the initial results don’t turn out quite as hoped:
              </p>
            </div>

            <div className="bg-[#191b1e] rounded-lg p-4 border border-gray-600 mb-4 shadow-shadowOne">
              <img src={pubPointGallery[2]} alt="Model output 3" className="w-full rounded-lg" />
            </div>

            <p className="text-red-400 font-semibold mb-4">✗ Result: Model clearly off – unrealistic high values and negative travel times.</p>
            <p className="text-lightText leading-relaxed mb-4">
              This time ignoring the map overlay and just looking at numbers, it’s clear this model is not very accurate. Firstly, the top 
              of the scale goes all the way up to nearly 4 hours of travel time to some areas, which is not the case in reality. And much 
              more problematically, the model is suggesting negative travel times to get to certain areas, which until the invention of time 
              travel is not the case either.
            </p>
            <p className="text-lightText leading-relaxed mb-6">
              These negative values imply that our model is under-smoothing, producing erratic, wavy predictions that fit our individual 
              training points too tightly. This means our estimated noise parameter (Sigma), allows too much local variation in the predicted 
              surface. One way to address this is to reduce Sigma to a very small value, near zero. This will enforce smoother, more stable 
              predictions and get rid of negative values. However, this loses the value of using a Gaussian Process, effectively turning our 
              model into a kriging interpolator with a zero-nugget term – or in other words, a model that just connects the dots between 
              training points without any uncertainty estimation.
            </p>
          </div>

          {/* Test 4 */}
          <div className="mb-12">
            <div className="bg-black bg-opacity-25 border border-designColor border-opacity-50 rounded-lg p-6 mb-6 shadow-shadowOne">
              <h3 className="text-xl font-titleFont font-semibold text-designColor mb-3">Test 4: Log Transform Fix</h3>
              <p className="text-lightText">
                Instead, since we know a priori that travel times must be positive, a better approach is to model the log of travel time instead. 
                This both forces predictions to be positive, and may even linearise the data, making it easier for the GP to capture the underlying 
                structure. Doing this instead leaves us with visually much better results:
              </p>
            </div>

            <div className="bg-[#191b1e] rounded-lg p-4 border border-gray-600 mb-4 shadow-shadowOne">
              <img src={pubPointGallery[3]} alt="Model output 4" className="w-full rounded-lg" />
            </div>

            <p className="text-yellow-400 font-semibold mb-4">~ Result: Visually far better, but error analysis shows problems...</p>
            <p className="text-lightText leading-relaxed">
              Our average travel times now look a lot more sensible, staying lower near the starting point and increasing as we move further 
              away. However, when we start evaluating it against the original simulation, we can see the drop against our original sample:
            </p>
          </div>

          {/* Test 5 */}
          <div className="mb-12">
            <div className="bg-[#191b1e] rounded-lg p-4 border border-gray-600 mb-4 shadow-shadowOne">
              <img src={pubPointGallery[4]} alt="Model output 5" className="w-full rounded-lg" />
            </div>

            <p className="text-red-400 font-semibold mb-4">✗ Differences reach up to an hour. Mean error ~13 minutes – far worse than target of 5.</p>
            <p className="text-lightText leading-relaxed">
              While giving results that may look sensible, the actual error analysis shows that this model is still not good enough. The differences
              between the emulated and actual travel times reach up to an hour in some cases, with a mean error of around 13 minutes – more than double our target of 5 minutes.
              This level of inaccuracy would likely lead to poor pub suggestions, as even small errors in travel time can significantly affect the overall ranking of pubs.
            </p>
          </div>
        </div>

        {/* Conclusion */}
        <div className="bg-black bg-opacity-25 border border-designColor border-opacity-50 rounded-lg p-8 shadow-shadowOne">
          <h2 className="text-2xl font-titleFont font-bold text-lightText mb-4">The Path Forward</h2>
          <p className="text-lightText leading-relaxed mb-4">
            Despite much trial and error around the settings and parameters we could use for this model, this result is the best 
            I was able to achieve for a full model of London. Regardless of how good the maths is, 5000 training points is simply 
            not a large enough sample size to model the entirety of the city. As roughly estimated above, I believe we would need 
            {" "}<span className="text-designColor font-bold">2.5 million samples</span> which would set us back nearly 
            £5k from the Google API.
          </p>
          <p className="text-lightText leading-relaxed">
            Avoiding this, our next steps would likely need to be finding an alternative, cheaper data source and then seeing how well 
            our modelling handles such a large dataset. Utilising as much free data as we can get for now, we can slowly build up our database 
            and reevaluate regularly, until one day we are a left with an acceptable emulator to make the basis of PubPoint.
          </p>
        </div>
      </article>

      {/* Footer spacing */}
      <div className="h-16"></div>
    </section>
  );
};

export default PubPointBlog;