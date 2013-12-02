p[dateStamp]

metadata
========
p[fileIdentifier]  
p[metadataLanguage]  
p[responsiblePartyMetadata]  
> p[responsiblePartyMetadata][0][organisationName]  
> p[responsiblePartyMetadata][0][electronicMailAddress]
p[browserGraphic]

identification
==============
p[identifier]
> p[identifier][0][code]  
> p[identifier][0][codespace]

p[title]  
p[abstract]  
p[onlineResource][]  
p[hierarchyLevel]
p[language][]

classification
==============
p[topicCategory][]


keyword
=======
p[keyword]  
> p[keyword][title][value][]  
> p[keyword][title][date]  
> p[keyword][title][type]

geographic
==========
p[bbox]
> p[bbox][0][nLatitude]
> p[bbox][0][eLongitude]
> p[bbox][0][sLatitude]
> p[bbox][0][wLongitude]

temporal
========
p[creationDate]
p[publicationDate]
p[revisionDate]

p[temporalExtent]
> p[temporalExtent][0][begin]
> p[temporalExtent][0][end]

quality
=======
p[lineage]
md_metadata[1].dataqualityinfo[1].dq_dataquality[1].lineage[1].li_lineage[1].statement[1].characterstring[1]

p[resolution][0][denominator]
p[resolution][0][distance]
p[resolution][0][uom]

md_metadata[1].identificationinfo[1].md_dataidentification[1].spatialresolution[1].md_resolution[1].equivalentscale[1].md_representativefraction[1].denominator[1].integer[1]
md_metadata[1].identificationinfo[1].md_dataidentification[1].spatialresolution[1].md_resolution[1].distance[1].distance[1]
md_metadata[1].identificationinfo[1].md_dataidentification[1].spatialresolution[1].md_resolution[1].distance[1].distance[1].@uom

conformity
==========
p[dataquality]
> p[dataquality][0][title]
> p[dataquality][0][date]
> p[dataquality][0][type]
> p[dataquality][0][result]

constraints
===========
p[uselimitation][]
p[otherconstraints][]

responsibleparty
================
p[responsibleParty]
> p[responsibleParty][0][organisationName]
> p[responsibleParty][0][electronicMailAddress]
> p[responsibleParty][0][role]
> p[responsibleParty][0][individualName]
> p[responsibleParty][0][country]
> p[responsibleParty][0][administrativeArea]
> p[responsibleParty][0][deliveryPoint]
> p[responsibleParty][0][city]
> p[responsibleParty][0][postalCode]
> p[responsibleParty][0][voice]
> p[responsibleParty][0][facsimile]
> p[responsibleParty][0][onlineResource]