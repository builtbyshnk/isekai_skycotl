const publicPrefix = "/isekai";

export default {
  fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === `${publicPrefix}/`) {
      url.pathname = publicPrefix;
      return Response.redirect(url, 308);
    }

    if (url.pathname === publicPrefix) {
      url.pathname = "/";
      return env.ASSETS.fetch(new Request(url, request));
    }

    if (!url.pathname.startsWith(`${publicPrefix}/`)) {
      return new Response("Not found", { status: 404 });
    }

    url.pathname = url.pathname.slice(publicPrefix.length) || "/";
    return env.ASSETS.fetch(new Request(url, request));
  },
};
