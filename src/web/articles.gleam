import gleam/list
import lustre/attribute.{class}
import lustre/element/html.{div, text}
import rada/date.{type Date, compare, to_iso_string}
import web/types.{type Article, Article}
import web/utils.{mk_link, mk_page_title}

fn time_fromstr(time: String) -> Date {
  let assert Ok(parsed) = time |> date.from_iso_string
  parsed
}

pub fn articles() {
  [
    Article(
      "Zuul Hands on - part 2 - Your first gated patch with Zuul",
      "https://www.softwarefactory-project.io/zuul-hands-on-part-2-your-first-gated-patch-with-zuul.html",
      "2018-09-17" |> time_fromstr,
    ),
    Article(
      "Zuul Hands on - part 3 - Use the Zuul jobs library",
      "https://www.softwarefactory-project.io/zuul-hands-on-part-3-use-the-zuul-jobs-library.html",
      "2018-09-20" |> time_fromstr,
    ),
    Article(
      "Zuul Hands on - part 4 - The gate pipeline",
      "https://www.softwarefactory-project.io/zuul-hands-on-part-4-the-gate-pipeline.html",
      "2018-10-02" |> time_fromstr,
    ),
    Article(
      " Zuul Hands on - part 5 - Job Secrets",
      "https://www.softwarefactory-project.io/zuul-hands-on-part-5-job-secrets.html",
      "2018-11-20" |> time_fromstr,
    ),
    Article(
      "Zuul Pagure Driver Update",
      "https://www.softwarefactory-project.io/zuul-pagure-driver-update.html",
      "2018-12-18" |> time_fromstr,
    ),
    Article(
      "CI/CD workflow offered by Zuul/Nodepool on Software Factory",
      "https://www.softwarefactory-project.io/cicd-workflow-offered-by-zuulnodepool-on-software-factory.html",
      "2019-01-31" |> time_fromstr,
    ),
    Article(
      "Using Dhall to generate Fedora CI Zuul config",
      "https://www.softwarefactory-project.io/using-dhall-to-generate-fedora-ci-zuul-config.html",
      "2021-01-10" |> time_fromstr,
    ),
    Article(
      "Introduction to </> htmx through a Simple WEB chat application",
      "https://www.softwarefactory-project.io/introduction-to-htmx-through-a-simple-web-chat-application.html",
      "2022-09-26" |> time_fromstr,
    ),
    Article(
      "Howto manage shareable, reproducible Nix environments via nix-shell",
      "https://www.softwarefactory-project.io/howto-manage-shareable-reproducible-nix-environments-via-nix-shell.html",
      "2023-01-24" |> time_fromstr,
    ),
    Article(
      "Reproducible Shell environments via Nix Flakes",
      "https://www.softwarefactory-project.io/reproducible-shell-environments-via-nix-flakes.html",
      "2023-01-24" |> time_fromstr,
    ),
    Article(
      "Monocle Operator - Phase 1 - Basic Install",
      "https://www.softwarefactory-project.io/monocle-operator-phase-1-basic-install.html",
      "2023-03-10" |> time_fromstr,
    ),
    Article(
      "Monocle Operator - OLM",
      "https://www.softwarefactory-project.io/monocle-operator-olm.html",
      "2023-05-15" |> time_fromstr,
    ),
  ]
}

fn view_article(article: Article) {
  div([class("flex gap-1")], [
    div([class("basis-2/12")], [article.date |> to_iso_string |> text]),
    div([class("basis-10/12")], [mk_link(article.url, article.name)]),
  ])
}

pub fn view_articles(_model) {
  div([], [
    div([], [mk_page_title("Articles")]),
    div([], [
      div(
        [class("flex flex-col gap-2")],
        articles()
          |> list.sort(fn(a, b) { compare(b.date, a.date) })
          |> list.map(view_article),
      ),
    ]),
  ])
}
