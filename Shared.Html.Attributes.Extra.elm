module Shared.Html.Attributes.Extra exposing (conditional, empty, maybe)

import Html
import Html.Attributes as Attrs
import Json.Encode as Encode


{-| Empty attribute
-}
empty : Html.Attribute msg
empty =
    Attrs.property "" Encode.null


{-| Conditional attribute.
If condition succeed then it returns given attribute.
Otherwise it returns an empty attribute.
-}
conditional : Bool -> Html.Attribute msg -> Html.Attribute msg
conditional condition attr =
    if condition then
        attr
    else
        empty


{-| Maybe attribute.
If given value is just value then it will be passed to the function to make attribute.
Otherwise it returns empty attribute.
-}
maybe : Maybe a -> (a -> Html.Attribute msg) -> Html.Attribute msg
maybe someMaybe toAttr =
    someMaybe
        |> Maybe.map toAttr
        |> Maybe.withDefault empty
