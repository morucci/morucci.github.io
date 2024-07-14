import gleam/dynamic
import gleam/io
import lustre_http
import web/types.{GitHubProjectRemoteInfo, OnGotGitHubProject}

pub fn build_full_name(org: String, name: String) -> String {
  org <> "/" <> name
}

pub fn mk_changes_url(name: String, org: String) {
  "https://github.com/"
  <> build_full_name(org, name)
  <> "/pulls?q=is%3Apr+is%3Aclosed+author%3Amorucci+"
}

pub fn mk_commits_url(name: String, org: String) {
  "https://github.com/"
  <> build_full_name(org, name)
  <> "/commits/?author=morucci"
}

pub fn get_project(name: String, org: String) {
  io.debug("fetching remote infos for " <> build_full_name(org, name))
  let decoder =
    dynamic.decode4(
      GitHubProjectRemoteInfo,
      dynamic.field("full_name", dynamic.string),
      dynamic.field("stargazers_count", dynamic.int),
      dynamic.field("language", dynamic.string),
      dynamic.field("description", dynamic.optional(dynamic.string)),
    )
  let url = "https://api.github.com/repos/" <> org <> "/" <> name
  lustre_http.get(url, lustre_http.expect_json(decoder, OnGotGitHubProject))
}
