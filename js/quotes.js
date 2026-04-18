document.addEventListener("DOMContentLoaded", function() {
    const quotes = [
      "the studio of sparkles",
      "made by swag developers", 
      "super gay",
      "ready to build amazing stuff",
      "amazing stuff",
      "a great site on computers, somewhat good for mobile as well",
      "let's make something cool",
     "something cool",
     "bryce is secretly a femboy but no one will know since no one reads this",
     "shoutout to t0p for letting me borrow his code for this",
     "something that shows up on the embed preview",
     "oh hey",
     "clanker",
     "follow @pydra on defcon.social",
     "wavelength had over 300 users tracked before the chat crashed",
     "someone add me on steam please, i need people to play with 1314080231",
     "my computer is a potato so that's why the site is named this",
     "why are we so gay",
     "isosceles triangle does eventually devolve into compressed jpg",
     "this is random everytime by the way",
     "boston industries",
     "please request games i need the ad revenue",
     "TSArchive moment",
     "shoutout to Mr J",
     "i miss u Mr J",
     "sup guys here's my friends debit card info 4097 5801 1034 2265 expiry 05/30 cvv 553",
     `"I will say, I do love how we are just decompiling games cause we want them on websites, totally ignoring the other implications of that like being able to fix abandonware, mod games, archival, basically just any shit we want" - MinoDab492`,
     "i literally only have $2.66 in my wallet right now",
     "i have 17 cents in ad revenue from the time caesium had ads for not even a day",
     "im friends with a communist femboy",
     "there's a reason why i put ads on the site, cause im broke",
     "hi elliot",
     "use screenzen to help with your phone addiction",
     "donate to pydra.dev please",
     "i promise you this is not a sponsorship for raid shadow legends",
     "trans rights are human rights",
     "we promise we're not gay (or are we?)",
     "this website tracks with counter.dev",
     "shoutout to mullvad vpn",
          "not a shoutout",
     "chat i think we turned the frogs gay",
     "chat can we turn the frogs gay?"

    ];

    const random = quotes[Math.floor(Math.random() * quotes.length)];

    // title

    document.getElementById("quotes").innerText = random;
  });