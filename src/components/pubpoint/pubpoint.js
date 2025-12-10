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
            The exact approach we have gone for with this emulator is to follow the work of Vernon et al. – use Bayesian
            Emulation with a Gaussian Process (GP) model to emulate the results around an initial set of training data. The
            maths behind this can get a little detailed, but the principal is relatively simple. We know exactly what the
            values are for our emulator at each point of our training data, and we estimate the values in between. These
            estimates are weighted by the values of the training data around them, with the results being normally
            distributed thanks to the GP.
          </p>
        </div>

        {/* Technical Details */}
        <div className="mb-16">
          <h2 className="text-3xl font-titleFont font-bold text-lightText mb-8">Building the Emulator</h2>
          
          <div className="grid gap-4 mb-8">
            <div className="bg-black bg-opacity-25 border border-gray-600 rounded-lg p-6 shadow-shadowOne hover:bg-opacity-40 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <h3 className="text-lg font-titleFont font-semibold text-designColor mb-2">True Function</h3>
              <p className="text-lightText">The travel time from the Google API from any start point to any endpoint.</p>
            </div>

            <div className="bg-black bg-opacity-25 border border-gray-600 rounded-lg p-6 shadow-shadowOne hover:bg-opacity-40 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <h3 className="text-lg font-titleFont font-semibold text-designColor mb-2">Solution Space</h3>
              <p className="text-lightText">Four dimensions: <span className="font-mono text-designColor">origin_lat</span>, <span className="font-mono text-designColor">origin_lng</span>, <span className="font-mono text-designColor">destination_lat</span>, <span className="font-mono text-designColor">destination_lng</span></p>
            </div>

            <div className="bg-black bg-opacity-25 border border-gray-600 rounded-lg p-6 shadow-shadowOne hover:bg-opacity-40 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <h3 className="text-lg font-titleFont font-semibold text-designColor mb-2">Mean (Beta Function)</h3>
              <p className="text-lightText">Initial estimate: everywhere in London is 45 minutes away.</p>
            </div>

            <div className="bg-black bg-opacity-25 border border-gray-600 rounded-lg p-6 shadow-shadowOne hover:bg-opacity-40 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <h3 className="text-lg font-titleFont font-semibold text-designColor mb-2">Standard Deviation & Correlation Length</h3>
              <p className="text-lightText">Sigma estimated from training data. Theta set to roughly a quarter of London's width.</p>
            </div>
          </div>
        </div>

        {/* Experiments */}
        <div className="mb-16">
          <h2 className="text-3xl font-titleFont font-bold text-lightText mb-8">Testing & Results</h2>

          {/* Test 1 */}
          <div className="mb-12">
            <div className="bg-black bg-opacity-25 border border-designColor border-opacity-50 rounded-lg p-6 mb-6 shadow-shadowOne">
              <h3 className="text-xl font-titleFont font-semibold text-designColor mb-3">Test 1: Single Starting Point (70×70 grid)</h3>
              <p className="text-lightText">
                We take our starting point as Warwick Avenue station and train a 70×70 grid across London.
              </p>
            </div>
            
            <div className="bg-[#191b1e] rounded-lg p-4 border border-gray-600 mb-4 shadow-shadowOne">
              <img src={pubPointGallery[0]} alt="Model output 1" className="w-full rounded-lg" />
            </div>
            
            <p className="text-green-400 font-semibold">✓ Result: Looking good! You can even see obvious patterns based on the areas.</p>
          </div>

          {/* Test 2 */}
          <div className="mb-12">
            <div className="bg-black bg-opacity-25 border border-designColor border-opacity-50 rounded-lg p-6 mb-6 shadow-shadowOne">
              <h3 className="text-xl font-titleFont font-semibold text-designColor mb-3">Test 2: Empirical Validation (30 locations)</h3>
              <p className="text-lightText">
                Comparing the difference between our emulated model and the real simulation.
              </p>
            </div>
            
            <div className="bg-[#191b1e] rounded-lg p-4 border border-gray-600 mb-4 shadow-shadowOne">
              <img src={pubPointGallery[1]} alt="Model output 2" className="w-full rounded-lg" />
            </div>
            
            <p className="text-green-400 font-semibold">✓ Result: All samples within 18 minutes of actual value. Mean error ~5 minutes.</p>
          </div>

          {/* Test 3 */}
          <div className="mb-12">
            <div className="bg-black bg-opacity-25 border border-designColor border-opacity-50 rounded-lg p-6 mb-6 shadow-shadowOne">
              <h3 className="text-xl font-titleFont font-semibold text-designColor mb-3">Test 3: Full 4D Model (5000-point Latin Hypercube)</h3>
              <p className="text-lightText">
                Scaling to the complete 4-dimensional model across all of London.
              </p>
            </div>
            
            <div className="bg-[#191b1e] rounded-lg p-4 border border-gray-600 mb-4 shadow-shadowOne">
              <img src={pubPointGallery[2]} alt="Model output 3" className="w-full rounded-lg" />
            </div>
            
            <p className="text-red-400 font-semibold">✗ Result: Model clearly off – unrealistic high values and negative travel times.</p>
          </div>

          {/* Test 4 */}
          <div className="mb-12">
            <div className="bg-black bg-opacity-25 border border-designColor border-opacity-50 rounded-lg p-6 mb-6 shadow-shadowOne">
              <h3 className="text-xl font-titleFont font-semibold text-designColor mb-3">Test 4: Log Transform Fix</h3>
              <p className="text-lightText">
                Modeling log travel time instead to fix under-smoothing issues.
              </p>
            </div>
            
            <div className="bg-[#191b1e] rounded-lg p-4 border border-gray-600 mb-4 shadow-shadowOne">
              <img src={pubPointGallery[3]} alt="Model output 4" className="w-full rounded-lg" />
            </div>
            
            <p className="text-yellow-400 font-semibold">~ Result: Visually far better, but error analysis shows problems...</p>
          </div>

          {/* Test 5 */}
          <div className="mb-12">
            <div className="bg-[#191b1e] rounded-lg p-4 border border-gray-600 mb-4 shadow-shadowOne">
              <img src={pubPointGallery[4]} alt="Model output 5" className="w-full rounded-lg" />
            </div>
            
            <p className="text-red-400 font-semibold">✗ Differences reach up to an hour. Mean error ~13 minutes – far worse than target of 5.</p>
          </div>
        </div>

        {/* Conclusion */}
        <div className="bg-black bg-opacity-25 border border-designColor border-opacity-50 rounded-lg p-8 shadow-shadowOne">
          <h2 className="text-2xl font-titleFont font-bold text-lightText mb-4">The Path Forward</h2>
          <p className="text-lightText leading-relaxed mb-4">
            Despite plenty of tweaking, 5000 training points simply isn't enough to model all of London. Something closer
            to <span className="text-designColor font-bold">2.5 million samples</span> (~£5k API cost) is likely needed.
          </p>
          <p className="text-lightText leading-relaxed">
            Our next step: hunt for cheaper data, build the database slowly, and keep refining the emulator until it's good enough to power PubPoint.
          </p>
        </div>
      </article>

      {/* Footer spacing */}
      <div className="h-16"></div>
    </section>
  );
};

export default PubPointBlog;